import {
  MATTER_SERVICE_LABELS,
  REGION_LABELS,
  REPORT_FREQUENCY_LABELS,
} from '@/domain/prices'
import type { ProposalTemplateSnapshot } from './proposalTemplateSnapshot'
import { MATTER_SERVICE_KEYS } from '@/domain/types'

export interface TemplateDescription {
  serviceCount: number
  includeLines: string[]
}

export function describeTemplateSnapshot(
  snapshot: ProposalTemplateSnapshot,
): TemplateDescription {
  const sec = snapshot.sections.marcas
  const activeServices = MATTER_SERVICE_KEYS.filter((k) => sec.services[k])
  const labels = activeServices.map((k) => MATTER_SERVICE_LABELS[k])

  const lines: string[] = []

  if (labels.length) {
    lines.push(`Serviços por matéria: ${labels.join(', ')}.`)
  } else {
    lines.push('Serviços por matéria: nenhum selecionado.')
  }

  const r = snapshot.reports
  const reportItems: string[] = []
  if (r.executivoEnabled && r.executivoFreq) {
    reportItems.push(`Executivo ${REPORT_FREQUENCY_LABELS[r.executivoFreq].toLowerCase()}`)
  }
  if (r.estrategicoEnabled && r.estrategicoFreq) {
    reportItems.push(`Estratégico ${REPORT_FREQUENCY_LABELS[r.estrategicoFreq].toLowerCase()}`)
  }
  if (r.biEnabled) reportItems.push('CService BI')
  if (reportItems.length) {
    lines.push(`Relatórios: ${reportItems.join(' · ')}.`)
  }

  const a = snapshot.additionals
  const extras: string[] = []
  if (a.tvEnabled && a.tvRegion) extras.push(`TV ${REGION_LABELS[a.tvRegion]}`)
  if (a.radioEnabled && a.radioRegion) extras.push(`Rádio ${REGION_LABELS[a.radioRegion]}`)
  if (a.midiasSociaisEnabled) extras.push('Mídias sociais')
  if (a.storiesInstagramEnabled) extras.push('Stories Instagram')
  if (a.alertasWebRealtime) extras.push('Alertas web')
  if (a.apiCService) extras.push('API CService')
  if (a.newsletterWhatsApp) extras.push('Newsletter WhatsApp')
  if (a.curadoriaAprovacaoManual) extras.push('Curadoria manual')
  if (extras.length) {
    lines.push(`Adicionais: ${extras.join(', ')}.`)
  }

  if (snapshot.applyServicesToAll) {
    lines.push('Serviços de matéria replicados em marcas, concorrentes e setor.')
  }

  return {
    serviceCount: activeServices.length,
    includeLines: lines,
  }
}

export function matterServiceLabelsFromSnapshot(
  snapshot: ProposalTemplateSnapshot,
): string[] {
  const sec = snapshot.sections.marcas
  return MATTER_SERVICE_KEYS.filter((k) => sec.services[k]).map(
    (k) => MATTER_SERVICE_LABELS[k],
  )
}
