import type { LucideIcon } from 'lucide-react'
import {
  Camera,
  FileBarChart,
  FileText,
  Gauge,
  Highlighter,
  Newspaper,
  RadioTower,
  Sparkles,
  Star,
  Tv as TvIcon,
} from 'lucide-react'
import { MONITORING_LABELS } from '@/domain/prices'
import type { MonitoringServiceKey } from '@/domain/types'
import { MONITORING_SERVICE_KEYS } from '@/domain/types'
import type { ProposalTemplateSnapshot } from './proposalTemplateSnapshot'

const MONITORING_ICONS: Record<MonitoringServiceKey, LucideIcon> = {
  texto: FileText,
  centimetragem: Newspaper,
  grifo: Highlighter,
  score: Gauge,
  avaliacao: Star,
  ia: Sparkles,
  screenshot: Camera,
}

export interface TemplateCardChip {
  id: string
  label: string
  Icon: LucideIcon
}

export interface TemplateCardContent {
  includedChips: TemplateCardChip[]
  includedCount: number
  distribution: { envios: string; destinatarios: string }
  extras: string[]
}

function monitoringChipLabel(key: MonitoringServiceKey): string {
  if (key === 'centimetragem') return 'Clipping'
  return MONITORING_LABELS[key]
}

function regionShort(region: string) {
  if (region === 'sp_rj') return 'SP/RJ'
  if (region === 'nacional') return 'Nacional'
  return region
}

export function templateCardContentFromSnapshot(
  s: ProposalTemplateSnapshot,
): TemplateCardContent {
  const chips: TemplateCardChip[] = []
  const sec = s.sections.marcas

  for (const k of MONITORING_SERVICE_KEYS) {
    if (!sec.services[k]) continue
    chips.push({
      id: `mon-${k}`,
      label: monitoringChipLabel(k),
      Icon: MONITORING_ICONS[k],
    })
  }

  const b = s.broadcast
  if (b.relatorioEnabled && b.relatorioFreq) {
    chips.push({
      id: 'relatorio',
      label: 'Relatório',
      Icon: FileBarChart,
    })
  }

  if (b.tvEnabled && b.tvRegion) {
    chips.push({
      id: 'tv',
      label: `TV ${regionShort(b.tvRegion)}`,
      Icon: TvIcon,
    })
  }

  if (b.radioEnabled && b.radioRegion) {
    chips.push({
      id: 'radio',
      label: `Rádio ${regionShort(b.radioRegion)}`,
      Icon: RadioTower,
    })
  }

  const op = s.operational
  const extras: string[] = []
  const a = s.additionals
  if (a.api) extras.push('API')
  if (a.alertasWeb) extras.push('Alertas')
  if (a.midiasSociais) extras.push('Mídias sociais')
  if (a.stories) extras.push('Stories')
  if (a.destaques) extras.push('Destaques')

  return {
    includedChips: chips,
    includedCount: chips.length,
    distribution: {
      envios: `${op.enviosDiarios} ${op.enviosDiarios === 1 ? 'envio por dia' : 'envios por dia'}`,
      destinatarios: `${op.numDestinatarios} destinatário${op.numDestinatarios === 1 ? '' : 's'}`,
    },
    extras,
  }
}
