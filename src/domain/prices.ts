import type {
  BillingMode,
  MatterServiceKey,
  ReportFrequency,
  SectionKey,
} from './types'
import { REPORT_FREQUENCIES } from './types'

/** Configuração de preço de um Serviço por Matéria (item 5). */
export interface MatterServiceConfig {
  mode: BillingMode
  fixedPrice: number
  variablePrice: number
}

/** Faixa de preço para Avaliação (rótulo exibido no combo + valores fixo/variável). */
export interface AvaliacaoTier {
  id: string
  label: string
  fixedPrice: number
  variablePrice: number
}

export interface AvaliacaoConfig {
  mode: BillingMode
  tiers: AvaliacaoTier[]
}

/** Faixa genérica para Mídias Sociais, Stories e Destinatários Adicionais. */
export interface RangeTier {
  id: string
  label: string
  upTo: number
  price: number
}

export interface ReportFrequencyPrices {
  byFrequency: Record<ReportFrequency, number>
}

export interface BiPrices {
  setupPrice: number
  monthlyMaintenance: number
}

export interface ReportsPrices {
  executivo: ReportFrequencyPrices
  estrategico: ReportFrequencyPrices
  bi: BiPrices
}

export interface AdditionalsPrices {
  /** Valor mensal único do monitoramento impresso. */
  impresso: number
  /** Web: nacional e internacional (preços separados; na proposta podem ser ambos ligados). */
  web: { nacional: number; internacional: number }
  radio: { spRj: number; nacional: number }
  tv: { spRj: number; nacional: number }
  midiasSociais: { tiers: RangeTier[] }
  storiesInstagram: { tiers: RangeTier[] }
  alertasWebRealtime: number
  apiCService: number
  newsletterWhatsApp: number
  newsletterExtraEnvio: number
  destinatariosExtras: { tiers: RangeTier[] }
  /** Percentual configurável aplicado como acréscimo sobre o total (item 7.11). */
  plantaoPercent: number
  curadoriaAprovacaoManual: number
  /** Percentual configurável aplicado como desconto sobre o total (item 7.13). */
  aprovacaoAutomaticaPercent: number
}

/** Catálogo completo de preços configurável pelo administrador. */
export interface Prices {
  matterServices: {
    centimetragem: MatterServiceConfig
    grifo: MatterServiceConfig
    score: MatterServiceConfig
    ia: MatterServiceConfig
    screenshot: MatterServiceConfig
    avaliacao: AvaliacaoConfig
  }
  reports: ReportsPrices
  additionals: AdditionalsPrices
  /** Opções de validade em dias que o comercial pode escolher (item 8). */
  validadeOptions: number[]
}

function makeMatter(
  mode: BillingMode,
  fixedPrice: number,
  variablePrice: number,
): MatterServiceConfig {
  return { mode, fixedPrice, variablePrice }
}

function zeroReportFrequencies(): ReportFrequencyPrices {
  const byFrequency = {} as Record<ReportFrequency, number>
  for (const f of REPORT_FREQUENCIES) byFrequency[f] = 0
  return { byFrequency }
}

export const DEFAULT_PRICES: Prices = {
  matterServices: {
    centimetragem: makeMatter('both', 0, 0),
    grifo: makeMatter('both', 0, 0),
    score: makeMatter('variable', 0, 0),
    ia: makeMatter('both', 0, 0),
    screenshot: makeMatter('variable', 0, 0),
    avaliacao: {
      mode: 'both',
      tiers: [
        {
          id: 'aval-ex-1',
          label: 'Exemplo 1',
          fixedPrice: 0,
          variablePrice: 0,
        },
        {
          id: 'aval-ex-2',
          label: 'Exemplo 2',
          fixedPrice: 0,
          variablePrice: 0,
        },
      ],
    },
  },
  reports: {
    executivo: zeroReportFrequencies(),
    estrategico: zeroReportFrequencies(),
    bi: { setupPrice: 0, monthlyMaintenance: 0 },
  },
  additionals: {
    impresso: 0,
    web: { nacional: 0, internacional: 0 },
    radio: { spRj: 0, nacional: 0 },
    tv: { spRj: 0, nacional: 0 },
    midiasSociais: {
      tiers: [
        { id: 'ms-ex-1', label: 'Exemplo 1', upTo: 0, price: 0 },
        { id: 'ms-ex-2', label: 'Exemplo 2', upTo: 0, price: 0 },
      ],
    },
    storiesInstagram: {
      tiers: [
        { id: 'sg-ex-1', label: 'Exemplo 1', upTo: 0, price: 0 },
        { id: 'sg-ex-2', label: 'Exemplo 2', upTo: 0, price: 0 },
      ],
    },
    alertasWebRealtime: 0,
    apiCService: 0,
    newsletterWhatsApp: 0,
    newsletterExtraEnvio: 0,
    destinatariosExtras: {
      tiers: [
        { id: 'de-ex-1', label: 'Exemplo 1', upTo: 0, price: 0 },
        { id: 'de-ex-2', label: 'Exemplo 2', upTo: 0, price: 0 },
      ],
    },
    plantaoPercent: 0,
    curadoriaAprovacaoManual: 0,
    aprovacaoAutomaticaPercent: 0,
  },
  validadeOptions: [30],
}

/** Preço base mensal inicial (item 4). */
export const DEFAULT_PRECO_BASE_MENSAL = 0

export const MATTER_SERVICE_LABELS: Record<MatterServiceKey, string> = {
  centimetragem: 'Centimetragem',
  grifo: 'Grifo',
  score: 'Score',
  ia: 'IA',
  screenshot: 'Screenshot',
  avaliacao: 'Avaliação',
}

export const MATTER_SERVICE_SHORT_LABELS: Record<MatterServiceKey, string> = {
  centimetragem: 'Centimetragem',
  grifo: 'Grifo',
  score: 'Score',
  ia: 'IA',
  screenshot: 'Screenshot',
  avaliacao: 'Avaliação',
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  marcas: 'Marcas',
  concorrentes: 'Concorrentes',
  setor: 'Setor',
}

export const REPORT_FREQUENCY_LABELS: Record<ReportFrequency, string> = {
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
}

export const REGION_LABELS: Record<'spRj' | 'nacional', string> = {
  spRj: 'SP + RJ',
  nacional: 'Nacional',
}

export const BILLING_MODE_LABELS: Record<BillingMode, string> = {
  fixed: 'Preço fixo',
  variable: 'Preço por volume',
  both: 'Fixo e variável',
}

/** Garante chaves novas em `additionals` quando a tabela veio de storage antigo. */
export function normalizeAdditionalsPrices(
  a: Partial<AdditionalsPrices> | Record<string, unknown> | undefined,
): AdditionalsPrices {
  const d = DEFAULT_PRICES.additionals
  if (!a || typeof a !== 'object') return { ...d }

  const raw = a as Record<string, unknown>
  const legacyWebIntl =
    typeof raw.webInternacional === 'number' && Number.isFinite(raw.webInternacional)
      ? raw.webInternacional
      : undefined

  let impresso = d.impresso
  if (typeof raw.impresso === 'number' && Number.isFinite(raw.impresso)) {
    impresso = raw.impresso
  } else if (raw.impresso && typeof raw.impresso === 'object') {
    const o = raw.impresso as { spRj?: number; nacional?: number }
    impresso = Number(o.nacional ?? o.spRj ?? d.impresso)
  }

  let web = { ...d.web }
  if (raw.web && typeof raw.web === 'object') {
    const w = raw.web as Record<string, unknown>
    if ('internacional' in w && 'nacional' in w) {
      web = {
        nacional: Number(w.nacional ?? d.web.nacional),
        internacional: Number(w.internacional ?? d.web.internacional),
      }
    } else {
      const o = raw.web as { spRj?: number; nacional?: number }
      web = {
        nacional: Number(o.nacional ?? o.spRj ?? d.web.nacional),
        internacional: Number(legacyWebIntl ?? d.web.internacional),
      }
    }
  } else if (legacyWebIntl !== undefined) {
    web = { ...d.web, internacional: legacyWebIntl }
  }

  const x = { ...d, ...raw }
  return {
    ...x,
    impresso,
    web,
    radio: { ...d.radio, ...(raw.radio as AdditionalsPrices['radio'] | undefined) },
    tv: { ...d.tv, ...(raw.tv as AdditionalsPrices['tv'] | undefined) },
    midiasSociais: {
      tiers:
        (a as AdditionalsPrices).midiasSociais?.tiers ?? d.midiasSociais.tiers,
    },
    storiesInstagram: {
      tiers:
        (a as AdditionalsPrices).storiesInstagram?.tiers ?? d.storiesInstagram.tiers,
    },
    destinatariosExtras: {
      tiers:
        (a as AdditionalsPrices).destinatariosExtras?.tiers ??
        d.destinatariosExtras.tiers,
    },
    alertasWebRealtime: Number(x.alertasWebRealtime ?? d.alertasWebRealtime),
    apiCService: Number(x.apiCService ?? d.apiCService),
    newsletterWhatsApp: Number(x.newsletterWhatsApp ?? d.newsletterWhatsApp),
    newsletterExtraEnvio: Number(x.newsletterExtraEnvio ?? d.newsletterExtraEnvio),
    plantaoPercent: Number(x.plantaoPercent ?? d.plantaoPercent),
    curadoriaAprovacaoManual: Number(
      x.curadoriaAprovacaoManual ?? d.curadoriaAprovacaoManual,
    ),
    aprovacaoAutomaticaPercent: Number(
      x.aprovacaoAutomaticaPercent ?? d.aprovacaoAutomaticaPercent,
    ),
  }
}

export function normalizePrices(p: Prices): Prices {
  return {
    ...p,
    additionals: normalizeAdditionalsPrices(
      p.additionals as unknown as Record<string, unknown>,
    ),
  }
}
