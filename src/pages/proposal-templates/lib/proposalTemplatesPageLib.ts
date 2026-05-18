import type { BuiltinTemplateCategory } from '@/features/proposal/lib/proposalTemplates'
import type { TemplateCardContent } from '@/features/proposal/lib/proposalTemplateCardContent'

export type TemplateTabId =
  | 'todos'
  | 'monitoramento'
  | 'tv-radio'
  | 'digital'
  | 'personalizados'

export type TemplateAccent = 'violet' | 'green' | 'orange' | 'blue'

export type RowCategory = BuiltinTemplateCategory | 'personalizados'

export type SortId = 'mais-utilizados' | 'recentes' | 'nome'

export interface TemplateListRow {
  id: string
  source: 'builtin' | 'user'
  name: string
  description: string
  tierLabel: string
  usedInProposals: number
  lastUsedDisplay: string
  sortKeyRecent: number
  category: RowCategory
  accent: TemplateAccent
  cardContent: TemplateCardContent
  searchBlob: string
}

export const TABS: { id: TemplateTabId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'monitoramento', label: 'Monitoramento' },
  { id: 'tv-radio', label: 'TV & Rádio' },
  { id: 'digital', label: 'Digital' },
  { id: 'personalizados', label: 'Personalizados' },
]

export function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

export function parseBrDate(value: string) {
  const [dd, mm, yyyy] = value.split('/').map((part) => Number.parseInt(part, 10))
  if (
    !Number.isFinite(dd)
    || !Number.isFinite(mm)
    || !Number.isFinite(yyyy)
  ) {
    return 0
  }
  return new Date(yyyy, mm - 1, dd).getTime()
}

export function formatPtShort(ts: number | null) {
  if (ts == null) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(ts)
}
