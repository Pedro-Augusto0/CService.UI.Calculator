import { useEffect } from 'react'
import {
  calculateProposalState,
  formatProposalNumber,
  resolveProposalMeta,
  toCalculationInputFromState,
  type SavedProposalRecord,
  type SavedProposalStatus,
} from '@/features/proposal/lib/savedProposalStore'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { buildProposalHtml } from '@/utils/buildProposalHtml'
import { formatCurrency } from '@/utils/currency'
import { downloadHtmlDocument, proposalFilename } from '@/utils/downloadHtml'
import { formatEditedAt } from '@/pages/saved-proposals/lib/presentation'
import { closeOpenMenus, closeParentDetails } from '@/pages/saved-proposals/lib/dom'
import { STATUS_LABELS } from '@/pages/saved-proposals/lib/statusMeta'
import { useSavedProposalsListing } from '@/pages/saved-proposals/hooks/useSavedProposalsListing'

export interface SavedProposalsPageCallbacks {
  onNovaProposta: () => void
  onOpenProposal: (id: string) => void
  onPreviewProposal: (html: string) => void
}

export function useSavedProposalsPage({
  onNovaProposta,
  onOpenProposal,
  onPreviewProposal,
}: SavedProposalsPageCallbacks) {
  const {
    savedProposals,
    duplicateSavedProposal,
    updateSavedProposalStatus,
  } = useProposal()
  const {
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
  } = useSavedProposalsListing(savedProposals)

  useEffect(() => {
    if (!isFilterModalOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!filterPopoverRef.current?.contains(event.target as Node)) {
        setIsFilterModalOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterModalOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFilterModalOpen])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof HTMLElement)) return

      const currentMenu = event.target.closest(
        '.saved-page__status-menu, .saved-page__actions-menu, .saved-page__services-popover',
      )

      closeOpenMenus(
        currentMenu instanceof HTMLDetailsElement ? currentMenu : null,
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeOpenMenus()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function resetAdvancedFilters() {
    setStatusFilter('todos')
    setClientFilter('todos')
    setSortOrder('recentes')
  }

  function handleExportList() {
    const header = [
      'Numero',
      'Cliente',
      'Proposta',
      'Status',
      'Valor mensal',
      'Volume monitorado',
      'Ultima edicao',
    ]
    const lines = filteredRows.map((row) => [
      formatProposalNumber(row.record.proposalNumber),
      row.clientName,
      row.proposalName,
      STATUS_LABELS[row.record.status],
      formatCurrency(row.finalPrice),
      `${row.totalVolume} noticias/mes`,
      formatEditedAt(row.record.updatedAt),
    ])

    const csv = [header, ...lines]
      .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'propostas-salvas.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function handlePreview(record: SavedProposalRecord) {
    const calculationInput = toCalculationInputFromState(record.state)
    const calculation = calculateProposalState(record.state)
    const html = buildProposalHtml(calculationInput, calculation, {
      meta: record.state.meta,
      generatedAt: record.updatedAt,
    })
    onPreviewProposal(html)
  }

  function handleDownloadProposal(record: SavedProposalRecord) {
    const calculationInput = toCalculationInputFromState(record.state)
    const calculation = calculateProposalState(record.state)
    const html = buildProposalHtml(calculationInput, calculation, {
      meta: record.state.meta,
      generatedAt: record.updatedAt,
    })
    const meta = resolveProposalMeta(record.state)

    downloadHtmlDocument(
      html,
      proposalFilename(meta.clientName, record.proposalNumber),
    )
  }

  function handleDuplicateFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
  ) {
    duplicateSavedProposal(recordId)
    closeParentDetails(event.currentTarget)
  }

  function handleDownloadFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    record: SavedProposalRecord,
  ) {
    handleDownloadProposal(record)
    closeParentDetails(event.currentTarget)
  }

  function handleOpenFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
  ) {
    onOpenProposal(recordId)
    closeParentDetails(event.currentTarget)
  }

  function handlePreviewFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    record: SavedProposalRecord,
  ) {
    handlePreview(record)
    closeParentDetails(event.currentTarget)
  }

  function handleStatusChangeFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
    status: SavedProposalStatus,
  ) {
    updateSavedProposalStatus(recordId, status)
    closeParentDetails(event.currentTarget)
  }

  function handleMenuToggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open) {
      closeOpenMenus(event.currentTarget)
    }
  }

  return {
    onNovaProposta,
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
    resetAdvancedFilters,
    handleExportList,
    handlePreview,
    handleDownloadProposal,
    handleDuplicateFromMenu,
    handleDownloadFromMenu,
    handleOpenFromMenu,
    handlePreviewFromMenu,
    handleStatusChangeFromMenu,
    handleMenuToggle,
  }
}
