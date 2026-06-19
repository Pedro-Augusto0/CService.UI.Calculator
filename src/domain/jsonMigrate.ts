import type { Prices } from './prices'
import { normalizePrices } from './prices'
import type { ReportFrequency } from './types'

/** Legacy Portuguese → English key map (flat keys only). */
const FLAT_KEY_MAP: Record<string, string> = {
  marcas: 'brands',
  concorrentes: 'competitors',
  setor: 'sector',
  centimetragem: 'columnInches',
  grifo: 'highlight',
  ia: 'ai',
  avaliacao: 'assessment',
  executivo: 'executive',
  estrategico: 'strategic',
  impresso: 'print',
  nacional: 'national',
  internacional: 'international',
  webInternacional: 'webInternational',
  midiasSociais: 'socialMedia',
  destinatariosExtras: 'extraRecipients',
  semanal: 'weekly',
  quinzenal: 'biweekly',
  mensal: 'monthly',
  trimestral: 'quarterly',
  semestral: 'semiannual',
  anual: 'annual',
  executiveEnabled: 'executiveEnabled',
  executiveFreq: 'executiveFrequency',
  executivoEnabled: 'executiveEnabled',
  executivoFreq: 'executiveFrequency',
  strategicEnabled: 'strategicEnabled',
  strategicFrequency: 'strategicFrequency',
  strategicFreq: 'strategicFrequency',
  estrategicoEnabled: 'strategicEnabled',
  estrategicoFreq: 'strategicFrequency',
  print: 'print',
  printEnabled: 'printEnabled',
  impressoEnabled: 'printEnabled',
  webNationalEnabled: 'webNationalEnabled',
  webNacionalEnabled: 'webNationalEnabled',
  webInternationalEnabled: 'webInternationalEnabled',
  webInternacionalEnabled: 'webInternationalEnabled',
  socialMedia: 'socialMedia',
  socialMediaEnabled: 'socialMediaEnabled',
  socialMediaTierId: 'socialMediaTierId',
  midiasSociaisEnabled: 'socialMediaEnabled',
  midiasSociaisTierId: 'socialMediaTierId',
  alertasWebRealtime: 'webRealtimeAlerts',
  newsletterExtraSends: 'newsletterExtraSends',
  newsletterExtraEnvios: 'newsletterExtraSends',
  newsletterExtraSend: 'newsletterExtraSend',
  newsletterExtraEnvio: 'newsletterExtraSend',
  extraRecipients: 'extraRecipients',
  extraRecipientsEnabled: 'extraRecipientsEnabled',
  extraRecipientsTierId: 'extraRecipientsTierId',
  destinatariosExtrasEnabled: 'extraRecipientsEnabled',
  destinatariosExtrasTierId: 'extraRecipientsTierId',
  weekendOnCall: 'weekendOnCall',
  plantaoFimSemana: 'weekendOnCall',
  onCallPercent: 'onCallPercent',
  plantaoPercent: 'onCallPercent',
  manualCuration: 'manualCuration',
  manualCurationFee: 'manualCurationFee',
  autoApproval: 'autoApproval',
  aprovacaoAutomatica: 'autoApproval',
  autoApprovalPercent: 'autoApprovalDiscountPercent',
  autoApprovalDiscountPercent: 'autoApprovalDiscountPercent',
  aprovacaoAutomaticaPercent: 'autoApprovalDiscountPercent',
  baseMonthlyPrice: 'baseMonthlyPrice',
  precoBaseMensal: 'baseMonthlyPrice',
  validityDays: 'validityDays',
  validadeDias: 'validityDays',
  validityOptions: 'validityOptions',
  validadeOptions: 'validityOptions',
  totalDiscountPercent: 'totalDiscountPercent',
  descontoTotalPercent: 'totalDiscountPercent',
  assessmentTierId: 'assessmentTierId',
  avaliacaoTierId: 'assessmentTierId',
  onCallSurchargeAmount: 'onCallSurchargeAmount',
  autoApprovalDiscountAmount: 'autoApprovalDiscountAmount',
  amountBeforeCommercialDiscount: 'amountBeforeCommercialDiscount',
  totalDiscountAmount: 'totalDiscountAmount',
  matterServices: 'matterServices',
  reportsBi: 'reportsBi',
  additionalServices: 'additionalServices',
  rascunho: 'draft',
  enviada: 'sent',
  aprovada: 'approved',
  expirada: 'expired',
}

const REPORT_FREQ_LEGACY: Record<string, ReportFrequency> = {
  semanal: 'weekly',
  quinzenal: 'biweekly',
  mensal: 'monthly',
  trimestral: 'quarterly',
  semestral: 'semiannual',
  anual: 'annual',
}

const REGION_LEGACY: Record<string, 'spRj' | 'national'> = {
  nacional: 'national',
}

const STATUS_LEGACY: Record<string, string> = {
  rascunho: 'draft',
  enviada: 'sent',
  aprovada: 'approved',
  expirada: 'expired',
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Deep-remaps object keys using FLAT_KEY_MAP at every nesting level.
 * Arrays are mapped element-wise; primitives pass through unchanged.
 */
export function deepRemapKeys<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepRemapKeys(item)) as T
  }
  if (!isPlainObject(value)) {
    return value as T
  }

  const result: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    const newKey = FLAT_KEY_MAP[key] ?? key
    result[newKey] = deepRemapKeys(child)
  }
  return result as T
}

function migrateReportFrequency(value: unknown): unknown {
  if (typeof value === 'string' && value in REPORT_FREQ_LEGACY) {
    return REPORT_FREQ_LEGACY[value]
  }
  return value
}

function migrateRegion(value: unknown): unknown {
  if (typeof value === 'string' && value in REGION_LEGACY) {
    return REGION_LEGACY[value]
  }
  return value
}

function migrateStatus(value: unknown): unknown {
  if (typeof value === 'string' && value in STATUS_LEGACY) {
    return STATUS_LEGACY[value]
  }
  return value
}

function migrateLegacyAdditionals(additionals: Record<string, unknown>): void {
  if (
    'curadoriaAprovacaoManual' in additionals &&
    typeof additionals.curadoriaAprovacaoManual === 'boolean'
  ) {
    additionals.manualCuration = additionals.curadoriaAprovacaoManual
    delete additionals.curadoriaAprovacaoManual
  }
}

function migrateLegacyReports(reports: Record<string, unknown>): void {
  if ('executiveFreq' in reports) {
    reports.executiveFrequency = migrateReportFrequency(reports.executiveFreq)
    delete reports.executiveFreq
  }
  if ('executivoFreq' in reports) {
    reports.executiveFrequency = migrateReportFrequency(reports.executivoFreq)
    delete reports.executivoFreq
  }
  if ('strategicFreq' in reports) {
    reports.strategicFrequency = migrateReportFrequency(reports.strategicFreq)
    delete reports.strategicFreq
  }
  if ('estrategicoFreq' in reports) {
    reports.strategicFrequency = migrateReportFrequency(reports.estrategicoFreq)
    delete reports.estrategicoFreq
  }
  if (reports.executiveFrequency != null) {
    reports.executiveFrequency = migrateReportFrequency(reports.executiveFrequency)
  }
  if (reports.strategicFrequency != null) {
    reports.strategicFrequency = migrateReportFrequency(reports.strategicFrequency)
  }
}

/** Migrates a legacy proposal/calculation state blob from localStorage or API. */
export function migrateProposalState<T extends Record<string, unknown>>(raw: T): T {
  const remapped = deepRemapKeys(raw) as T & {
    reports?: Record<string, unknown>
    additionals?: Record<string, unknown>
  }

  if (remapped.reports) {
    migrateLegacyReports(remapped.reports)
  }

  if (remapped.additionals) {
    migrateLegacyAdditionals(remapped.additionals)
    if (remapped.additionals.radioRegion != null) {
      remapped.additionals.radioRegion = migrateRegion(remapped.additionals.radioRegion)
    }
    if (remapped.additionals.tvRegion != null) {
      remapped.additionals.tvRegion = migrateRegion(remapped.additionals.tvRegion)
    }
  }

  if (remapped.activeScopeTab != null && typeof remapped.activeScopeTab === 'string') {
    const tab = remapped.activeScopeTab as string
    ;(remapped as Record<string, unknown>).activeScopeTab = FLAT_KEY_MAP[tab] ?? tab
  }

  return remapped
}

/** Migrates legacy pricing config from localStorage or API. */
export function migrateStoredPricingConfig<T extends Record<string, unknown>>(raw: T): T {
  const remapped = deepRemapKeys(raw) as T & {
    prices?: Prices
    baseMonthlyPrice?: number
    precoBaseMensal?: number
  }
  if (typeof remapped.precoBaseMensal === 'number' && remapped.baseMonthlyPrice == null) {
    remapped.baseMonthlyPrice = remapped.precoBaseMensal
  }
  delete remapped.precoBaseMensal
  if (remapped.prices) {
    remapped.prices = normalizePrices(remapped.prices)
  }
  return remapped
}

/** Migrates legacy Prices object (without full normalization). */
export function migratePrices(raw: unknown): Prices {
  const remapped = deepRemapKeys(raw) as Record<string, unknown>
  if (
    remapped.additionals &&
    isPlainObject(remapped.additionals) &&
    typeof remapped.additionals.curadoriaAprovacaoManual === 'number'
  ) {
    remapped.additionals.manualCurationFee = remapped.additionals.curadoriaAprovacaoManual
    delete remapped.additionals.curadoriaAprovacaoManual
  }
  return remapped as unknown as Prices
}

/** Migrates a saved proposal record (status + nested state). */
export function migrateSavedProposalRecord<T extends { status?: unknown; state?: unknown }>(
  raw: T,
): T {
  const remapped = deepRemapKeys(raw) as T
  if (typeof remapped.status === 'string') {
    remapped.status = migrateStatus(remapped.status) as T['status']
  }
  if (remapped.state && isPlainObject(remapped.state)) {
    remapped.state = migrateProposalState(remapped.state)
  }
  return remapped
}
