import { useMemo, useState } from 'react'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { templateCardContentFromSnapshot } from '@/features/proposal/lib/proposalTemplateCardContent'
import {
  BUILTIN_TEMPLATE_CARDS,
  getBuiltinTemplateSnapshot,
} from '@/features/proposal/lib/proposalTemplates'
import {
  formatPtShort,
  normalizeQuery,
  parseBrDate,
  type SortId,
  type TemplateListRow,
  type TemplateTabId,
} from '@/pages/proposal-templates/lib/proposalTemplatesPageLib'

export function useProposalTemplatesPage() {
  const { userProposalTemplates } = useProposal()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TemplateTabId>('todos')
  const [sort, setSort] = useState<SortId>('mais-utilizados')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const allRows = useMemo((): TemplateListRow[] => {
    const builtIns: TemplateListRow[] = BUILTIN_TEMPLATE_CARDS.map((b) => {
      const snap = getBuiltinTemplateSnapshot(b.id)
      const cardContent = templateCardContentFromSnapshot(snap)
      const searchBlob = [
        b.name,
        b.description,
        ...cardContent.includedChips.map((c) => c.label),
        ...cardContent.extras,
        cardContent.distribution.envios,
        cardContent.distribution.destinatarios,
      ]
        .join(' ')
        .toLowerCase()
      return {
        id: b.id,
        source: 'builtin',
        name: b.name,
        description: b.description,
        tierLabel: b.tierLabel,
        usedInProposals: b.usedInProposals,
        lastUsedDisplay: b.lastUsedDisplay,
        sortKeyRecent: parseBrDate(b.lastUsedDisplay),
        category: b.category,
        accent: b.accent,
        cardContent,
        searchBlob,
      }
    })

    const userRows: TemplateListRow[] = userProposalTemplates.map((u) => {
      const snap = u.snapshot
      const cardContent = templateCardContentFromSnapshot(snap)
      const desc =
        u.description || 'Sem descrição — edite o modelo para orientar a equipe.'
      const searchBlob = [
        u.name,
        desc,
        ...cardContent.includedChips.map((c) => c.label),
        ...cardContent.extras,
        cardContent.distribution.envios,
        cardContent.distribution.destinatarios,
      ]
        .join(' ')
        .toLowerCase()
      return {
        id: u.id,
        source: 'user',
        name: u.name,
        description: desc,
        tierLabel: 'Personalizado',
        usedInProposals: u.usedCount,
        lastUsedDisplay: formatPtShort(u.lastUsedAt),
        sortKeyRecent: u.lastUsedAt ?? u.updatedAt,
        category: 'personalizados',
        accent: 'violet',
        cardContent,
        searchBlob,
      }
    })

    return [...builtIns, ...userRows]
  }, [userProposalTemplates])

  const filteredSorted = useMemo(() => {
    const q = normalizeQuery(query)
    const base = allRows.filter((row) => {
      if (tab === 'personalizados') {
        if (row.source !== 'user') return false
      } else if (tab !== 'todos') {
        if (row.source !== 'builtin' || row.category !== tab) return false
      }
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q)
        || row.description.toLowerCase().includes(q)
        || row.searchBlob.includes(q)
      )
    })

    const next = [...base]
    if (sort === 'mais-utilizados') {
      next.sort((a, b) => b.usedInProposals - a.usedInProposals)
    } else if (sort === 'nome') {
      next.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    } else {
      next.sort((a, b) => b.sortKeyRecent - a.sortKeyRecent)
    }
    return next
  }, [allRows, query, tab, sort])

  const customTemplatesCount = userProposalTemplates.length

  const mostUsedTemplateId = useMemo(() => {
    if (allRows.length === 0) return null
    const max = Math.max(...allRows.map((r) => r.usedInProposals))
    if (max <= 0) return null
    const top = allRows.filter((r) => r.usedInProposals === max)
    return top.length === 1 ? top[0].id : null
  }, [allRows])

  return {
    query,
    setQuery,
    tab,
    setTab,
    sort,
    setSort,
    view,
    setView,
    filteredSorted,
    customTemplatesCount,
    mostUsedTemplateId,
  }
}
