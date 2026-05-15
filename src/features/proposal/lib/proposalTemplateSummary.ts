import { MONITORING_LABELS } from '@/domain/prices'
import type { ProposalTemplateSnapshot } from './proposalTemplateSnapshot'
import { MONITORING_SERVICE_KEYS } from '@/domain/types'

export interface TemplateDescription {
  serviceCount: number
  /** Linhas curtas para o bloco “O que inclui” no cartão */
  includeLines: string[]
}

function regionLabel(region: string) {
  if (region === 'sp_rj') return 'SP/RJ'
  if (region === 'nacional') return 'Nacional'
  return region
}

function freqLabel(freq: string) {
  if (freq === 'semanal') return 'semanal'
  if (freq === 'mensal') return 'mensal'
  return freq
}

export function describeTemplateSnapshot(
  snapshot: ProposalTemplateSnapshot,
): TemplateDescription {
  const sec = snapshot.sections.marcas
  const activeServices = MONITORING_SERVICE_KEYS.filter((k) => sec.services[k])
  const labels = activeServices.map((k) => MONITORING_LABELS[k])

  const lines: string[] = []

  if (labels.length) {
    lines.push(`Monitoramento: ${labels.join(', ')}.`)
  } else {
    lines.push('Monitoramento: nenhum tipo selecionado.')
  }

  const op = snapshot.operational
  lines.push(
    `Distribuição: ${op.enviosDiarios} ${op.enviosDiarios === 1 ? 'envio' : 'envios'} por dia · ${op.numDestinatarios} destinatário${op.numDestinatarios === 1 ? '' : 's'}.`,
  )

  const b = snapshot.broadcast
  const bc: string[] = []
  if (b.tvEnabled && b.tvRegion) {
    bc.push(`TV (${regionLabel(b.tvRegion)})`)
  }
  if (b.radioEnabled && b.radioRegion) {
    bc.push(`Rádio (${regionLabel(b.radioRegion)})`)
  }
  if (b.relatorioEnabled && b.relatorioFreq) {
    bc.push(`Relatório ${freqLabel(b.relatorioFreq)}`)
  }
  if (bc.length) {
    lines.push(`Broadcast e relatório: ${bc.join(' · ')}.`)
  }

  const a = snapshot.additionals
  const extras: string[] = []
  if (a.midiasSociais) extras.push('Mídias sociais')
  if (a.alertasWeb) extras.push('Alertas web')
  if (a.api) extras.push('API')
  if (a.stories) extras.push('Stories')
  if (a.destaques) extras.push('Destaques da semana')
  if (extras.length) {
    lines.push(`Extras: ${extras.join(', ')}.`)
  }

  if (snapshot.applyServicesToAll) {
    lines.push('Serviços de monitoramento replicados em marcas, concorrentes e setor.')
  }

  return {
    serviceCount: activeServices.length,
    includeLines: lines,
  }
}

export function monitoringServiceLabelsFromSnapshot(
  snapshot: ProposalTemplateSnapshot,
): string[] {
  const sec = snapshot.sections.marcas
  return MONITORING_SERVICE_KEYS.filter((k) => sec.services[k]).map(
    (k) => MONITORING_LABELS[k],
  )
}
