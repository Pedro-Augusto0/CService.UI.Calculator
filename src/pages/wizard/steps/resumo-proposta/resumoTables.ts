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
  if (reports.executivoEnabled && reports.executivoFreq) {
    const price = prices.executivo.byFrequency[reports.executivoFreq] ?? 0
    rows.push({
      key: 'executivo',
      label: 'Relatório executivo',
      detail: REPORT_FREQUENCY_LABELS[reports.executivoFreq],
      value: price,
    })
  }
  if (reports.estrategicoEnabled && reports.estrategicoFreq) {
    const price = prices.estrategico.byFrequency[reports.estrategicoFreq] ?? 0
    rows.push({
      key: 'estrategico',
      label: 'Relatório estratégico',
      detail: REPORT_FREQUENCY_LABELS[reports.estrategicoFreq],
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

export function buildAdditionalsRows(
  additionals: AdditionalsState,
  prices: Prices['additionals'],
): PricedRow[] {
  const a = additionals
  const p = prices
  const rows: PricedRow[] = []

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
  if (a.midiasSociaisEnabled) {
    const tier = findTier(p.midiasSociais.tiers, a.midiasSociaisTierId)
    if (tier) {
      rows.push({
        key: 'midiasSociais',
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
  if (a.alertasWebRealtime) {
    rows.push({
      key: 'alertasWeb',
      label: 'Alertas Web',
      detail: 'Tempo real',
      value: p.alertasWebRealtime,
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
  if (a.newsletterExtraEnvios > 0) {
    rows.push({
      key: 'newsletterExtra',
      label: 'Envios extras de newsletter',
      detail: `${a.newsletterExtraEnvios} × unitário`,
      value: a.newsletterExtraEnvios * p.newsletterExtraEnvio,
    })
  }
  if (a.destinatariosExtrasEnabled) {
    const tier = findTier(p.destinatariosExtras.tiers, a.destinatariosExtrasTierId)
    if (tier) {
      rows.push({
        key: 'destinatarios',
        label: 'Destinatários extras',
        detail: tier.label,
        value: tier.price,
      })
    }
  }
  if (a.curadoriaAprovacaoManual) {
    rows.push({
      key: 'curadoria',
      label: 'Curadoria / aprovação manual',
      detail: 'Serviço',
      value: p.curadoriaAprovacaoManual,
    })
  }

  return rows
}
