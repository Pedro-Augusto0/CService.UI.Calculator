import type { LucideIcon } from 'lucide-react'
import {
  Camera,
  ClipboardCheck,
  FileBarChart,
  Gauge,
  Globe,
  Globe2,
  Highlighter,
  Newspaper,
  RadioTower,
  Sparkles,
  Tv as TvIcon,
} from 'lucide-react'
import { MATTER_SERVICE_SHORT_LABELS, REGION_LABELS } from '@/domain/prices'
import type { MatterServiceKey } from '@/domain/types'
import { MATTER_SERVICE_KEYS } from '@/domain/types'
import type { ProposalTemplateSnapshot } from './proposalTemplateSnapshot'

const MATTER_ICONS: Record<MatterServiceKey, LucideIcon> = {
  columnInches: Newspaper,
  highlight: Highlighter,
  score: Gauge,
  ai: Sparkles,
  screenshot: Camera,
  assessment: ClipboardCheck,
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

export function templateCardContentFromSnapshot(
  s: ProposalTemplateSnapshot,
): TemplateCardContent {
  const chips: TemplateCardChip[] = []
  const sec = s.sections.brands

  for (const k of MATTER_SERVICE_KEYS) {
    if (!sec.services[k]) continue
    chips.push({
      id: `mat-${k}`,
      label: MATTER_SERVICE_SHORT_LABELS[k],
      Icon: MATTER_ICONS[k],
    })
  }

  const r = s.reports
  if (r.executiveEnabled && r.executiveFrequency) {
    chips.push({ id: 'rep-exec', label: 'Executivo', Icon: FileBarChart })
  }
  if (r.strategicEnabled && r.strategicFrequency) {
    chips.push({ id: 'rep-estr', label: 'Estratégico', Icon: FileBarChart })
  }

  const a = s.additionals
  if (a.printEnabled) {
    chips.push({
      id: 'print',
      label: 'Impresso',
      Icon: Newspaper,
    })
  }
  if (a.webNationalEnabled) {
    chips.push({
      id: 'web-nac',
      label: 'Web (Nacional)',
      Icon: Globe,
    })
  }
  if (a.webInternationalEnabled) {
    chips.push({
      id: 'web-intl',
      label: 'Web (Internacional)',
      Icon: Globe2,
    })
  }
  if (a.tvEnabled && a.tvRegion) {
    chips.push({ id: 'tv', label: `TV ${REGION_LABELS[a.tvRegion]}`, Icon: TvIcon })
  }
  if (a.radioEnabled && a.radioRegion) {
    chips.push({
      id: 'radio',
      label: `Rádio ${REGION_LABELS[a.radioRegion]}`,
      Icon: RadioTower,
    })
  }

  const extras: string[] = []
  if (a.apiCService) extras.push('API')
  if (a.webRealtimeAlerts) extras.push('Alertas')
  if (a.socialMediaEnabled) extras.push('Mídias sociais')
  if (a.storiesInstagramEnabled) extras.push('Stories')
  if (a.newsletterWhatsApp) extras.push('Newsletter')
  if (a.manualCuration) extras.push('Curadoria')

  return {
    includedChips: chips,
    includedCount: chips.length,
    distribution: {
      envios: a.newsletterWhatsApp ? 'Newsletter WhatsApp' : 'Entrega padrão',
      destinatarios: a.extraRecipientsEnabled
        ? 'Destinatários extras configurados'
        : 'Lista padrão',
    },
    extras,
  }
}
