import { useMemo, useRef, useState } from 'react'
import {
  calculateProposalState,
  formatProposalNumber,
  resolveProposalMeta,
  type SavedProposalRecord,
  type SavedProposalStatus,
} from '@/features/proposal/lib/savedProposalStore'
import { collectExtraServices } from '@/pages/saved-proposals/lib/presentation'

export type SortOrder =
  | 'recentes'
  | 'antigas'
  | 'maior-valor'
  | 'menor-valor'
  | 'cliente'

export type ViewMode = 'list' | 'grid'

export interface SavedProposalRow {
  record: SavedProposalRecord
  clientName: string
  proposalName: string
  finalPrice: number
  totalVolume: number
  totalKeywords: number
  visibleServices: string[]
  hiddenServices: number
}

export function useSavedProposalsListing(
  savedProposals: SavedProposalRecord[],
) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'todos' | SavedProposalStatus
  >('todos')
  const [clientFilter, setClientFilter] = useState('todos')
  const [sortOrder, setSortOrder] = useState<SortOrder>('recentes')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const filterPopoverRef = useRef<HTMLDivElement | null>(null)

  const rows = useMemo<SavedProposalRow[]>(() => {
    return savedProposals.map((record) => {
      const meta = resolveProposalMeta(record.state)
      const calculation = calculateProposalState(record.state)
      const services = [
        ...calculation.selectedMatterLabels,
        ...collectExtraServices(record),
      ]
      const visibleServices = services.slice(0, 5)

      return {
        record,
        clientName: meta.clientName,
        proposalName: meta.proposalName,
        finalPrice: calculation.finalPrice,
        totalVolume: calculation.totalVolume,
        totalKeywords: calculation.totalKeywords,
        visibleServices,
        hiddenServices: Math.max(0, services.length - visibleServices.length),
      }
    })
  }, [savedProposals])

  const clients = useMemo(() => {
    return [...new Set(rows.map((row) => row.clientName))].sort((left, right) =>
      left.localeCompare(right, 'pt-BR'),
    )
  }, [rows])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

    const base = rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        row.clientName.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        row.proposalName.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        formatProposalNumber(row.record.proposalNumber).includes(normalizedQuery)
      const matchesStatus =
        statusFilter === 'todos' || row.record.status === statusFilter
      const matchesClient =
        clientFilter === 'todos' || row.clientName === clientFilter

      return matchesQuery && matchesStatus && matchesClient
    })

    return [...base].sort((left, right) => {
      switch (sortOrder) {
        case 'antigas':
          return left.record.updatedAt - right.record.updatedAt
        case 'maior-valor':
          return right.finalPrice - left.finalPrice
        case 'menor-valor':
          return left.finalPrice - right.finalPrice
        case 'cliente':
          return left.clientName.localeCompare(right.clientName, 'pt-BR')
        case 'recentes':
        default:
          return right.record.updatedAt - left.record.updatedAt
      }
    })
  }, [clientFilter, query, rows, sortOrder, statusFilter])

  const activeAdvancedFilterCount = useMemo(
    () =>
      Number(statusFilter !== 'todos') +
      Number(clientFilter !== 'todos') +
      Number(sortOrder !== 'recentes'),
    [clientFilter, sortOrder, statusFilter],
  )

  return {
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    sortOrder,
    setSortOrder,
    isFilterModalOpen,
    setIsFilterModalOpen,
    viewMode,
    setViewMode,
    filterPopoverRef,
    rows,
    clients,
    filteredRows,
    activeAdvancedFilterCount,
  }
}
