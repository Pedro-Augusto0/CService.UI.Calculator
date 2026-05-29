import type { Prices, RangeTier } from './prices'
import { MATTER_SERVICE_LABELS } from './prices'
import type {
  AdditionalsState,
  CalculationInput,
  CalculationResult,
  GlobalBillingMode,
  MatterServiceKey,
  ReportsState,
  SectionKey,
} from './types'
import { MATTER_SERVICE_KEYS, SECTION_KEYS } from './types'

function emptyMatterValues(): Record<MatterServiceKey, number> {
  const o = {} as Record<MatterServiceKey, number>
  for (const k of MATTER_SERVICE_KEYS) o[k] = 0
  return o
}

/**
 * Resolve o modo de cobrança efetivo para um serviço por matéria:
 * - 'fixed' ou 'variable' configurados pelo admin sempre prevalecem.
 * - 'both' segue o toggle global escolhido na proposta.
 */
export function effectiveMode(
  configMode: 'fixed' | 'variable' | 'both',
  toggle: GlobalBillingMode,
): GlobalBillingMode {
  if (configMode === 'both') return toggle
  return configMode
}

function findTier(tiers: RangeTier[], id: string | null): RangeTier | null {
  if (!id) return null
  return tiers.find((t) => t.id === id) ?? null
}

function additionalsBucket(
  additionals: AdditionalsState,
  prices: Prices,
): number {
  const a = additionals
  const p = prices.additionals
  let total = 0

  if (a.impressoEnabled) {
    total += p.impresso
  }
  if (a.webNacionalEnabled) {
    total += p.web.nacional
  }
  if (a.webInternacionalEnabled) {
    total += p.web.internacional
  }
  if (a.radioEnabled && a.radioRegion) {
    total += p.radio[a.radioRegion]
  }
  if (a.tvEnabled && a.tvRegion) {
    total += p.tv[a.tvRegion]
  }
  if (a.midiasSociaisEnabled) {
    const tier = findTier(p.midiasSociais.tiers, a.midiasSociaisTierId)
    if (tier) total += tier.price
  }
  if (a.storiesInstagramEnabled) {
    const tier = findTier(p.storiesInstagram.tiers, a.storiesInstagramTierId)
    if (tier) total += tier.price
  }
  if (a.alertasWebRealtime) total += p.alertasWebRealtime
  if (a.apiCService) total += p.apiCService
  if (a.newsletterWhatsApp) total += p.newsletterWhatsApp
  if (a.newsletterExtraEnvios > 0) {
    total += a.newsletterExtraEnvios * p.newsletterExtraEnvio
  }
  if (a.destinatariosExtrasEnabled) {
    const tier = findTier(p.destinatariosExtras.tiers, a.destinatariosExtrasTierId)
    if (tier) total += tier.price
  }
  if (a.curadoriaAprovacaoManual) total += p.curadoriaAprovacaoManual

  return total
}

function reportsBucket(reports: ReportsState, prices: Prices): number {
  let total = 0
  if (reports.executivoEnabled && reports.executivoFreq) {
    total += prices.reports.executivo.byFrequency[reports.executivoFreq] ?? 0
  }
  if (reports.estrategicoEnabled && reports.estrategicoFreq) {
    total += prices.reports.estrategico.byFrequency[reports.estrategicoFreq] ?? 0
  }
  if (reports.biEnabled) {
    total += prices.reports.bi.setupPrice + prices.reports.bi.monthlyMaintenance
  }
  return total
}

function selectedMatterLabels(
  matterValues: Record<MatterServiceKey, number>,
): string[] {
  return MATTER_SERVICE_KEYS.filter((k) => matterValues[k] > 0).map(
    (k) => MATTER_SERVICE_LABELS[k],
  )
}

/** Soma o volume apenas das seções em que o serviço está ligado (ex.: avaliação por escopo). */
export function volumeSumForService(
  sections: CalculationInput['sections'],
  service: MatterServiceKey,
): number {
  let sum = 0
  for (const sk of SECTION_KEYS) {
    const sec = sections[sk]
    if (sec.services[service]) sum += sec.volume
  }
  return sum
}

/**
 * Motor de cálculo da proposta — Fase 1.
 *
 * Ordem de aplicação:
 *  1. Soma Serviços por Matéria (modo resolvido por serviço; Avaliação usa uma faixa global e volume só onde está ligada).
 *  2. Soma Relatórios + BI.
 *  3. Soma Adicionais (fixos, faixas e fixo por envio extra de newsletter).
 *  4. Subtotal = matterServices + reports + additionals.
 *  5. Acréscimo Plantão de Finais de Semana/Feriados: × (1 + plantaoPercent/100).
 *  6. Desconto Aprovação Automática: × (1 - aprovacaoAutomaticaPercent/100).
 *  7. Preço Base Mensal é somado ao final (mínimo garantido do pacote).
 *  8. Desconto total comercial (na proposta): × (1 - descontoTotalPercent/100) sobre o valor do passo 7.
 */
export function updateCalculations(
  input: CalculationInput,
  prices: Prices,
): CalculationResult {
  let totalKeywords = 0
  let totalVolume = 0
  for (const sk of SECTION_KEYS) {
    const sec = input.sections[sk]
    totalKeywords += sec.keywords.length
    totalVolume += sec.volume
  }

  const matterServiceValues = emptyMatterValues()
  const selectedSet = new Set<MatterServiceKey>()
  for (const sk of SECTION_KEYS) {
    const sec = input.sections[sk]
    for (const svc of MATTER_SERVICE_KEYS) {
      if (sec.services[svc]) selectedSet.add(svc)
    }
  }

  for (const svc of selectedSet) {
    if (svc === 'avaliacao') {
      const conf = prices.matterServices.avaliacao
      const tier =
        conf.tiers.find((t) => t.id === input.avaliacaoTierId) ?? null
      if (!tier) continue
      const mode = effectiveMode(conf.mode, input.globalBillingMode)
      const volAval = volumeSumForService(input.sections, 'avaliacao')
      if (mode === 'fixed') {
        matterServiceValues.avaliacao += tier.fixedPrice
      } else {
        matterServiceValues.avaliacao += tier.variablePrice * volAval
      }
      continue
    }

    const conf = prices.matterServices[svc]
    const mode = effectiveMode(conf.mode, input.globalBillingMode)
    if (mode === 'fixed') {
      matterServiceValues[svc] += conf.fixedPrice
    } else {
      matterServiceValues[svc] += conf.variablePrice * totalVolume
    }
  }

  const matterServicesTotal = MATTER_SERVICE_KEYS.reduce(
    (acc, k) => acc + matterServiceValues[k],
    0,
  )

  const reportsTotal = reportsBucket(input.reports, prices)
  const additionalsTotal = additionalsBucket(input.additionals, prices)

  const subtotalBeforeModifiers =
    matterServicesTotal + reportsTotal + additionalsTotal

  const plantaoPercent = Math.max(0, prices.additionals.plantaoPercent)
  const aprovPercent = Math.max(0, prices.additionals.aprovacaoAutomaticaPercent)

  const factorPlantao = input.additionals.plantaoFimSemana
    ? 1 + plantaoPercent / 100
    : 1
  const factorAprovacao = input.additionals.aprovacaoAutomatica
    ? Math.max(0, 1 - aprovPercent / 100)
    : 1

  const afterPlantao = subtotalBeforeModifiers * factorPlantao
  const afterAprovacao = afterPlantao * factorAprovacao

  const valorAcrescimoPlantao = afterPlantao - subtotalBeforeModifiers
  const valorDescontoAprovacaoAutomatica = afterAprovacao - afterPlantao

  const precoBaseMensal = Math.max(0, Number(input.precoBaseMensal) || 0)
  const valorAntesDescontoComercial = afterAprovacao + precoBaseMensal

  const descontoTotalPercent = Math.min(
    100,
    Math.max(0, Number(input.descontoTotalPercent) || 0),
  )
  const factorDescontoTotal = 1 - descontoTotalPercent / 100
  const finalPrice = valorAntesDescontoComercial * factorDescontoTotal
  const valorDescontoTotal = finalPrice - valorAntesDescontoComercial

  const hasActiveServices =
    matterServicesTotal > 0 || reportsTotal > 0 || additionalsTotal > 0

  return {
    totalKeywords,
    totalVolume,
    hasActiveServices,
    matterServiceValues,
    matterServicesTotal,
    reportsTotal,
    additionalsTotal,
    subtotalBeforeModifiers,
    plantaoPercent,
    aprovacaoAutomaticaPercent: aprovPercent,
    factorPlantao,
    factorAprovacaoAutomatica: factorAprovacao,
    valorAcrescimoPlantao,
    valorDescontoAprovacaoAutomatica,
    valorAntesDescontoComercial,
    descontoTotalPercent,
    valorDescontoTotal,
    finalPrice,
    globalBillingMode: input.globalBillingMode,
    selectedMatterLabels: selectedMatterLabels(matterServiceValues),
    breakdownGroups: {
      precoBaseMensal,
      servicosMateria: matterServicesTotal,
      relatoriosBi: reportsTotal,
      servicosAdicionais: additionalsTotal,
    },
  }
}

export function defaultSections(): Record<SectionKey, {
  keywords: string[]
  volume: number
  services: Record<MatterServiceKey, boolean>
}> {
  const emptyServices = {} as Record<MatterServiceKey, boolean>
  for (const k of MATTER_SERVICE_KEYS) emptyServices[k] = false
  const make = () => ({
    keywords: [] as string[],
    volume: 0,
    services: { ...emptyServices },
  })
  return {
    marcas: make(),
    concorrentes: make(),
    setor: make(),
  }
}
