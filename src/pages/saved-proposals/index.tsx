import { SavedProposalsFiltersSection } from '@/pages/saved-proposals/components/SavedProposalsFiltersSection'
import { SavedProposalsHero } from '@/pages/saved-proposals/components/SavedProposalsHero'
import { SavedProposalsListSection } from '@/pages/saved-proposals/components/SavedProposalsListSection'
import { useSavedProposalsPage } from '@/pages/saved-proposals/hooks/useSavedProposalsPage'
import './SavedProposals.css'

interface SavedProposalsProps {
  onNovaProposta: () => void
  onOpenProposal: (id: string) => void
  onPreviewProposal: (html: string) => void
}

export function SavedProposals({
  onNovaProposta,
  onOpenProposal,
  onPreviewProposal,
}: SavedProposalsProps) {
  const p = useSavedProposalsPage({
    onNovaProposta,
    onOpenProposal,
    onPreviewProposal,
  })

  return (
    <div className="saved-page">
      <SavedProposalsHero
        onNovaProposta={p.onNovaProposta}
        onExportList={p.handleExportList}
        exportDisabled={p.filteredRows.length === 0}
      />

      <SavedProposalsFiltersSection
        query={p.query}
        setQuery={p.setQuery}
        statusFilter={p.statusFilter}
        setStatusFilter={p.setStatusFilter}
        clientFilter={p.clientFilter}
        setClientFilter={p.setClientFilter}
        sortOrder={p.sortOrder}
        setSortOrder={p.setSortOrder}
        isFilterModalOpen={p.isFilterModalOpen}
        setIsFilterModalOpen={p.setIsFilterModalOpen}
        viewMode={p.viewMode}
        setViewMode={p.setViewMode}
        filterPopoverRef={p.filterPopoverRef}
        clients={p.clients}
        activeAdvancedFilterCount={p.activeAdvancedFilterCount}
        resetAdvancedFilters={p.resetAdvancedFilters}
      />

      <SavedProposalsListSection
        rows={p.rows}
        filteredRows={p.filteredRows}
        viewMode={p.viewMode}
        onNovaProposta={p.onNovaProposta}
        handleMenuToggle={p.handleMenuToggle}
        handleStatusChangeFromMenu={p.handleStatusChangeFromMenu}
        handleOpenFromMenu={p.handleOpenFromMenu}
        handlePreviewFromMenu={p.handlePreviewFromMenu}
        handleDuplicateFromMenu={p.handleDuplicateFromMenu}
        handleDownloadFromMenu={p.handleDownloadFromMenu}
      />
    </div>
  )
}
