import type {
  BillingMode,
  MatterServiceKey,
  ReportFrequency,
  SectionKey,
} from './types'
import { REPORT_FREQUENCIES } from './types'
import { deepRemapKeys, migratePrices } from './jsonMigrate'

/** Configuração de preço de um Serviço por Matéria (item 5). */
export interface MatterServiceConfig {
  mode: BillingMode
  fixedPrice: number
  variablePrice: number
}

/** Faixa de preço para Avaliação (rótulo exibido no combo + valores fixo/variável). */
export interface AssessmentTier {
  id: string
  label: string
  fixedPrice: number
  variablePrice: number
}

export interface AssessmentConfig {
  mode: BillingMode
  tiers: AssessmentTier[]
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
  executive: ReportFrequencyPrices
  strategic: ReportFrequencyPrices
  bi: BiPrices
}

export interface AdditionalsPrices {
  /** Valor mensal único do monitoramento print. */
  print: number
  /** Web: nacional e internacional (preços separados; na proposta podem ser ambos ligados). */
  web: { national: number; international: number }
  radio: { spRj: number; national: number }
  tv: { spRj: number; national: number }
  socialMedia: { tiers: RangeTier[] }
  storiesInstagram: { tiers: RangeTier[] }
  webRealtimeAlerts: number
  apiCService: number
  newsletterWhatsApp: number
  newsletterExtraSend: number
  extraRecipients: { tiers: RangeTier[] }
  /** Percentual configurável aplicado como acréscimo sobre o total (item 7.11). */
  onCallPercent: number
  manualCurationFee: number
  /** Percentual configurável aplicado como desconto sobre o total (item 7.13). */
  autoApprovalDiscountPercent: number
}

/** Catálogo completo de preços configurável pelo administrador. */
export interface Prices {
  matterServices: {
    columnInches: MatterServiceConfig
    highlight: MatterServiceConfig
    score: MatterServiceConfig
    ai: MatterServiceConfig
    screenshot: MatterServiceConfig
    assessment: AssessmentConfig
  }
  reports: ReportsPrices
  additionals: AdditionalsPrices
  /** Opções de validade em dias que o comercial pode escolher (item 8). */
  validityOptions: number[]
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
    columnInches: makeMatter('both', 0, 0),
    highlight: makeMatter('both', 0, 0),
    score: makeMatter('both', 0, 0),
    ai: makeMatter('both', 0, 0),
    screenshot: makeMatter('both', 0, 0),
    assessment: {
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
    executive: zeroReportFrequencies(),
    strategic: zeroReportFrequencies(),
    bi: { setupPrice: 0, monthlyMaintenance: 0 },
  },
  additionals: {
    print: 0,
    web: { national: 0, international: 0 },
    radio: { spRj: 0, national: 0 },
    tv: { spRj: 0, national: 0 },
    socialMedia: {
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
    webRealtimeAlerts: 0,
    apiCService: 0,
    newsletterWhatsApp: 0,
    newsletterExtraSend: 0,
    extraRecipients: {
      tiers: [
        { id: 'de-ex-1', label: 'Exemplo 1', upTo: 0, price: 0 },
        { id: 'de-ex-2', label: 'Exemplo 2', upTo: 0, price: 0 },
      ],
    },
    onCallPercent: 0,
    manualCurationFee: 0,
    autoApprovalDiscountPercent: 0,
  },
  validityOptions: [30],
}

/** Preço base mensal inicial (item 4). */
export const DEFAULT_BASE_MONTHLY_PRICE = 0

export const MATTER_SERVICE_LABELS: Record<MatterServiceKey, string> = {
  columnInches: 'Centimetragem',
  highlight: 'Grifo',
  score: 'Score',
  ai: 'IA',
  screenshot: 'Screenshot',
  assessment: 'Avaliação',
}

export const MATTER_SERVICE_SHORT_LABELS: Record<MatterServiceKey, string> = {
  columnInches: 'Centimetragem',
  highlight: 'Grifo',
  score: 'Score',
  ai: 'IA',
  screenshot: 'Screenshot',
  assessment: 'Avaliação',
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  brands: 'Marcas',
  competitors: 'Concorrentes',
  sector: 'Setor',
}

export const REPORT_FREQUENCY_LABELS: Record<ReportFrequency, string> = {
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
}

export const REGION_LABELS: Record<'spRj' | 'national', string> = {
  spRj: 'SP + RJ',
  national: 'Nacional',
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

  const remapped = deepRemapKeys(a) as Record<string, unknown>
  const raw = remapped

  const legacyWebIntl =
    typeof raw.webInternacional === 'number' && Number.isFinite(raw.webInternacional)
      ? raw.webInternacional
      : undefined

  let print = d.print
  if (typeof raw.print === 'number' && Number.isFinite(raw.print)) {
    print = raw.print
  } else if (raw.print && typeof raw.print === 'object') {
    const o = raw.print as { spRj?: number; national?: number }
    print = Number(o.national ?? o.spRj ?? d.print)
  }

  let web = { ...d.web }
  if (raw.web && typeof raw.web === 'object') {
    const w = raw.web as Record<string, unknown>
    if ('international' in w && 'national' in w) {
      web = {
        national: Number(w.national ?? d.web.national),
        international: Number(w.international ?? d.web.international),
      }
    } else {
      const o = raw.web as { spRj?: number; national?: number }
      web = {
        national: Number(o.national ?? o.spRj ?? d.web.national),
        international: Number(legacyWebIntl ?? d.web.international),
      }
    }
  } else if (legacyWebIntl !== undefined) {
    web = { ...d.web, international: legacyWebIntl }
  }

  const x = { ...d, ...raw } as AdditionalsPrices
  return {
    ...x,
    print,
    web,
    radio: { ...d.radio, ...(raw.radio as AdditionalsPrices['radio'] | undefined) },
    tv: { ...d.tv, ...(raw.tv as AdditionalsPrices['tv'] | undefined) },
    socialMedia: {
      tiers:
        (a as AdditionalsPrices).socialMedia?.tiers ?? d.socialMedia.tiers,
    },
    storiesInstagram: {
      tiers:
        (a as AdditionalsPrices).storiesInstagram?.tiers ?? d.storiesInstagram.tiers,
    },
    extraRecipients: {
      tiers:
        (a as AdditionalsPrices).extraRecipients?.tiers ??
        d.extraRecipients.tiers,
    },
    webRealtimeAlerts: Number(x.webRealtimeAlerts ?? d.webRealtimeAlerts),
    apiCService: Number(x.apiCService ?? d.apiCService),
    newsletterWhatsApp: Number(x.newsletterWhatsApp ?? d.newsletterWhatsApp),
    newsletterExtraSend: Number(x.newsletterExtraSend ?? d.newsletterExtraSend),
    onCallPercent: Number(x.onCallPercent ?? d.onCallPercent),
    manualCurationFee: Number(
      x.manualCurationFee ?? d.manualCurationFee,
    ),
    autoApprovalDiscountPercent: Number(
      x.autoApprovalDiscountPercent ?? d.autoApprovalDiscountPercent,
    ),
  }
}

function looksLikeLegacyPrices(p: Record<string, unknown>): boolean {
  const ms = p.matterServices
  if (ms && typeof ms === 'object') {
    if ('centimetragem' in ms || 'grifo' in ms || 'avaliacao' in ms || 'ia' in ms) {
      return true
    }
  }
  const reports = p.reports
  if (reports && typeof reports === 'object' && 'executivo' in reports) {
    return true
  }
  const additionals = p.additionals
  if (
    additionals &&
    typeof additionals === 'object' &&
    ('impresso' in additionals || 'midiasSociais' in additionals)
  ) {
    return true
  }
  return false
}

export function normalizePrices(p: Prices | Record<string, unknown>): Prices {
  let base = p as Prices
  if (p && typeof p === 'object' && looksLikeLegacyPrices(p as Record<string, unknown>)) {
    base = migratePrices(p)
  }
  return {
    ...base,
    additionals: normalizeAdditionalsPrices(
      base.additionals as unknown as Record<string, unknown>,
    ),
  }
}
