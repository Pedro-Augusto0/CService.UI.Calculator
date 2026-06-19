import type { Prices, RangeTier } from '@/domain/prices'
import {
  REGION_LABELS,
  REPORT_FREQUENCY_LABELS,
} from '@/domain/prices'
import type { AdditionalsState, ReportsState } from '@/domain/types'

function findTier(tiers: RangeTier[], id: string | null): RangeTier | null {
  if (!id) return null
  return tiers.find((t) => t.id === id) ?? null
}

export interface PricedRow {
  key: string
  label: string
  detail: string
  value: number
}

export function buildReportRows(
  reports: ReportsState,
  prices: Prices['reports'],
): PricedRow[] {
  const rows: PricedRow[] = []
  if (reports.executiveEnabled && reports.executiveFrequency) {
    const price = prices.executive.byFrequency[reports.executiveFrequency] ?? 0
    rows.push({
      key: 'executive',
      label: 'Relatório executive',
      detail: REPORT_FREQUENCY_LABELS[reports.executiveFrequency],
      value: price,
    })
  }
  if (reports.strategicEnabled && reports.strategicFrequency) {
    const price = prices.strategic.byFrequency[reports.strategicFrequency] ?? 0
    rows.push({
      key: 'strategic',
      label: 'Relatório estratégico',
      detail: REPORT_FREQUENCY_LABELS[reports.strategicFrequency],
      value: price,
    })
  }
  if (reports.biEnabled) {
    const setup = prices.bi.setupPrice
    const monthly = prices.bi.monthlyMaintenance
    rows.push({
      key: 'bi',
      label: 'CService BI',
      detail: 'Implantação única + manutenção mensal (competência mensal)',
      value: setup + monthly,
    })
  }
  return rows
}

/** Canais de monitoramento (passo «Tipos de mídia»). */
export function buildMonitoramentosRows(
  additionals: AdditionalsState,
  prices: Prices['additionals'],
): PricedRow[] {
  const a = additionals
  const p = prices
  const rows: PricedRow[] = []

  if (a.printEnabled) {
    rows.push({
      key: 'print',
      label: 'Impresso',
      detail: 'Valor mensal',
      value: p.print,
    })
  }
  if (a.webNationalEnabled) {
    rows.push({
      key: 'webNacional',
      label: 'Web',
      detail: 'Nacional',
      value: p.web.national,
    })
  }
  if (a.webInternationalEnabled) {
    rows.push({
      key: 'webInternacional',
      label: 'Web',
      detail: 'Internacional',
      value: p.web.international,
    })
  }
  if (a.radioEnabled && a.radioRegion) {
    rows.push({
      key: 'radio',
      label: 'Rádio',
      detail: REGION_LABELS[a.radioRegion],
      value: p.radio[a.radioRegion],
    })
  }
  if (a.tvEnabled && a.tvRegion) {
    rows.push({
      key: 'tv',
      label: 'TV',
      detail: REGION_LABELS[a.tvRegion],
      value: p.tv[a.tvRegion],
    })
  }
  if (a.socialMediaEnabled) {
    const tier = findTier(p.socialMedia.tiers, a.socialMediaTierId)
    if (tier) {
      rows.push({
        key: 'socialMedia',
        label: 'Mídias sociais',
        detail: tier.label,
        value: tier.price,
      })
    }
  }
  if (a.storiesInstagramEnabled) {
    const tier = findTier(p.storiesInstagram.tiers, a.storiesInstagramTierId)
    if (tier) {
      rows.push({
        key: 'storiesInstagram',
        label: 'Stories Instagram',
        detail: tier.label,
        value: tier.price,
      })
    }
  }

  return rows
}

/** Relatórios, newsletter, alertas, API etc. (sem os canais de monitoramento). */
export function buildAdicionaisExtrasRows(
  additionals: AdditionalsState,
  prices: Prices['additionals'],
): PricedRow[] {
  const a = additionals
  const p = prices
  const rows: PricedRow[] = []

  if (a.webRealtimeAlerts) {
    rows.push({
      key: 'webRealtimeAlerts',
      label: 'Alertas Web',
      detail: 'Tempo real',
      value: p.webRealtimeAlerts,
    })
  }
  if (a.apiCService) {
    rows.push({
      key: 'api',
      label: 'API CService',
      detail: 'Integração',
      value: p.apiCService,
    })
  }
  if (a.newsletterWhatsApp) {
    rows.push({
      key: 'newsletter',
      label: 'Newsletter WhatsApp',
      detail: 'Faixa base',
      value: p.newsletterWhatsApp,
    })
  }
  if (a.newsletterExtraSends > 0) {
    rows.push({
      key: 'newsletterExtra',
      label: 'Envios extras de newsletter',
      detail: `${a.newsletterExtraSends} × unitário`,
      value: a.newsletterExtraSends * p.newsletterExtraSend,
    })
  }
  if (a.extraRecipientsEnabled) {
    const tier = findTier(p.extraRecipients.tiers, a.extraRecipientsTierId)
    if (tier) {
      rows.push({
        key: 'destinatarios',
        label: 'Destinatários extras',
        detail: tier.label,
        value: tier.price,
      })
    }
  }
  if (a.manualCuration) {
    rows.push({
      key: 'curadoria',
      label: 'Curadoria / aprovação manual',
      detail: 'Serviço',
      value: p.manualCurationFee,
    })
  }

  return rows
}

/** Todas as linhas de adicionais (monitoramentos + extras). */
export function buildAdditionalsRows(
  additionals: AdditionalsState,
  prices: Prices['additionals'],
): PricedRow[] {
  return [
    ...buildMonitoramentosRows(additionals, prices),
    ...buildAdicionaisExtrasRows(additionals, prices),
  ]
}

export function sumPricedRows(rows: PricedRow[]): number {
  return rows.reduce((acc, r) => acc + r.value, 0)
}
