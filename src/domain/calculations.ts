import type { Prices } from './prices'
import { MONITORING_LABELS } from './prices'
import type {
  CalculationInput,
  CalculationResult,
  MonitoringServiceKey,
  SectionKey,
  ServiceValues,
} from './types'
import { MONITORING_SERVICE_KEYS, SECTION_KEYS, SERVICE_VALUE_KEYS } from './types'

export function emptyServiceValues(): ServiceValues {
  const o = {} as ServiceValues
  for (const k of SERVICE_VALUE_KEYS) {
    o[k] = 0
  }
  return o
}

function sumServiceValues(sv: ServiceValues): number {
  let t = 0
  for (const k of SERVICE_VALUE_KEYS) {
    t += sv[k]
  }
  return t
}

function monitoringSum(sv: ServiceValues): number {
  let t = 0
  for (const k of MONITORING_SERVICE_KEYS) {
    t += sv[k]
  }
  return t
}

function additionalsDisplaySum(sv: ServiceValues): number {
  return (
    sv.tv +
    sv.radio +
    sv.midias_sociais +
    sv.alertas_web +
    sv.api +
    sv.stories +
    sv.destaques +
    sv.envios
  )
}

export function collectSelectedMonitoringLabels(
  sections: CalculationInput['sections'],
): string[] {
  const acc = new Set<MonitoringServiceKey>()
  for (const sk of SECTION_KEYS) {
    const sec = sections[sk]
    for (const svc of MONITORING_SERVICE_KEYS) {
      if (sec.services[svc]) acc.add(svc)
    }
  }
  return [...acc].map((k) => MONITORING_LABELS[k])
}

/**
 * Ordem e regras conforme especificação do produto.
 */
export function updateCalculations(
  input: CalculationInput,
  prices: Prices,
): CalculationResult {
  let totalKeywords = 0
  let totalVolume = 0
  const serviceValues = emptyServiceValues()
  let hasActiveServices = false

  for (const sectionKey of SECTION_KEYS) {
    const sec = input.sections[sectionKey]
    totalKeywords += sec.keywords.length
    totalVolume += sec.volume

    if (sec.volume > 0) {
      for (const svc of MONITORING_SERVICE_KEYS) {
        if (!sec.services[svc]) continue
        const unit = prices.servicePrices[svc]
        const totalServicePrice = unit * sec.volume
        serviceValues[svc] += totalServicePrice
        hasActiveServices = true
      }
    }
  }

  // Broadcast (atribuição direta)
  if (input.broadcast.tvEnabled && input.broadcast.tvRegion) {
    serviceValues.tv = prices.broadcast.tv[input.broadcast.tvRegion]
  }
  if (input.broadcast.radioEnabled && input.broadcast.radioRegion) {
    serviceValues.radio = prices.broadcast.radio[input.broadcast.radioRegion]
  }
  if (input.broadcast.relatorioEnabled && input.broadcast.relatorioFreq) {
    serviceValues.relatorio =
      prices.broadcast.relatorio[input.broadcast.relatorioFreq]
  }

  const envios = Math.max(0, Math.floor(Number(input.operational.enviosDiarios) || 0))

  // Serviços adicionais (checkboxes / toggles)
  if (input.additionals.midiasSociais) {
    const postsPerMonth = envios * 30
    const included = prices.additionals.midiasSociaisIncludedPosts
    if (postsPerMonth > included) {
      const step = prices.additionals.midiasSociaisExcessPostsStep
      const excessBlocks = Math.ceil((postsPerMonth - included) / step)
      serviceValues.midias_sociais =
        excessBlocks * prices.additionals.midiasSociaisExcessPricePerStep
    }
  }

  if (input.additionals.alertasWeb && envios > 1) {
    serviceValues.alertas_web =
      (envios - 1) * prices.additionals.alertasWebPricePerExtraEnvio
  }

  if (input.additionals.api) {
    serviceValues.api = prices.additionals.api
  }
  if (input.additionals.stories) {
    serviceValues.stories = prices.additionals.stories
  }
  if (input.additionals.destaques) {
    serviceValues.destaques = prices.additionals.destaques
  }

  const destinatarios = Math.max(
    0,
    Math.floor(Number(input.operational.numDestinatarios) || 0),
  )

  if (envios > 0 && destinatarios > 0) {
    const dias = input.operational.envioFeriadosFds ? 30 : 22
    serviceValues.envios =
      envios * destinatarios * dias * prices.destinatarioPrice
  }

  const volumeMonetaryBase = totalVolume * prices.volumePrice
  const sumSvc = sumServiceValues(serviceValues)
  const subtotalBeforeModifiers = volumeMonetaryBase + sumSvc

  const factorWeekend = input.operational.envioFeriadosFds ? 1.25 : 1
  const factorAutoApproval = input.operational.aprovacaoAutomatica ? 0.6 : 1

  let precoTotal = subtotalBeforeModifiers
  precoTotal *= factorWeekend
  const afterWeekend = precoTotal
  precoTotal *= factorAutoApproval
  const priceAfterModifiersBeforeMonthlyBase = precoTotal

  const valorAcrescimoFimDeSemana =
    factorWeekend > 1 ? afterWeekend - subtotalBeforeModifiers : 0
  const valorImpactoAprovacaoAutomatica =
    priceAfterModifiersBeforeMonthlyBase - afterWeekend

  const precoBaseMensal = Math.max(0, Number(input.precoBaseMensal) || 0)
  const finalPrice = priceAfterModifiersBeforeMonthlyBase + precoBaseMensal

  const servicosMonitoramento = volumeMonetaryBase + monitoringSum(serviceValues)
  const relatorioAnalitico = serviceValues.relatorio
  const servicosAdicionais = additionalsDisplaySum(serviceValues)

  return {
    totalKeywords,
    totalVolume,
    hasActiveServices,
    serviceValues,
    volumeMonetaryBase,
    sumServiceValues: sumSvc,
    subtotalBeforeModifiers,
    factorWeekend,
    factorAutoApproval,
    priceAfterModifiersBeforeMonthlyBase,
    valorAcrescimoFimDeSemana,
    valorImpactoAprovacaoAutomatica,
    finalPrice,
    selectedMonitoringLabels: collectSelectedMonitoringLabels(input.sections),
    breakdownGroups: {
      precoBaseMensal,
      servicosMonitoramento,
      servicosAdicionais,
      relatorioAnalitico,
    },
  }
}

export function defaultSections(): Record<
  SectionKey,
  { keywords: string[]; volume: number; services: Record<MonitoringServiceKey, boolean> }
> {
  const emptyServices = {} as Record<MonitoringServiceKey, boolean>
  for (const k of MONITORING_SERVICE_KEYS) {
    emptyServices[k] = false
  }
  const section = () => ({
    keywords: [] as string[],
    volume: 0,
    services: { ...emptyServices },
  })
  return {
    marcas: section(),
    concorrentes: section(),
    setor: section(),
  }
}
