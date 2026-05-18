import type { RefObject } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import { SAVED_PROPOSAL_STATUSES } from '@/features/proposal/lib/savedProposalStore'
import type { SavedProposalStatus } from '@/features/proposal/lib/savedProposalStore'
import type { SortOrder } from '@/pages/saved-proposals/hooks/useSavedProposalsListing'
import { STATUS_LABELS } from '@/pages/saved-proposals/lib/statusMeta'

export function SavedProposalsFiltersSection({
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
  clients,
  activeAdvancedFilterCount,
  resetAdvancedFilters,
}: {
  query: string
  setQuery: (v: string) => void
  statusFilter: 'todos' | SavedProposalStatus
  setStatusFilter: (v: 'todos' | SavedProposalStatus) => void
  clientFilter: string
  setClientFilter: (v: string) => void
  sortOrder: SortOrder
  setSortOrder: (v: SortOrder) => void
  isFilterModalOpen: boolean
  setIsFilterModalOpen: (v: boolean | ((o: boolean) => boolean)) => void
  viewMode: 'list' | 'grid'
  setViewMode: (v: 'list' | 'grid') => void
  filterPopoverRef: RefObject<HTMLDivElement | null>
  clients: string[]
  activeAdvancedFilterCount: number
  resetAdvancedFilters: () => void
}) {
  return (
    <section className="saved-page__filters" aria-label="Busca e filtros de propostas">
      <div className="saved-page__filters-bar">
        <label className="saved-page__search">
          <Search size={16} strokeWidth={2} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por cliente, proposta ou numero"
          />
        </label>

        <div className="saved-page__filter-popover" ref={filterPopoverRef}>
          <Button
            variant="secondary"
            className={`saved-page__filter-toggle${
              activeAdvancedFilterCount ? ' saved-page__filter-toggle--active' : ''
            }`}
            onClick={() => setIsFilterModalOpen((open) => !open)}
            aria-haspopup="dialog"
            aria-expanded={isFilterModalOpen}
            aria-controls="saved-page-filters-popover"
          >
            <SlidersHorizontal size={16} strokeWidth={2} aria-hidden />
            Filtros
            {activeAdvancedFilterCount ? (
              <span className="saved-page__filter-count">{activeAdvancedFilterCount}</span>
            ) : null}
          </Button>

          {isFilterModalOpen ? (
            <div
              id="saved-page-filters-popover"
              className="saved-page__filter-modal"
              role="dialog"
              aria-labelledby="saved-page-filters-title"
              aria-modal="false"
            >
              <div className="saved-page__filter-modal-header">
                <div>
                  <h2 id="saved-page-filters-title" className="saved-page__filter-modal-title">
                    Filtros avançados
                  </h2>
                  <p className="saved-page__filter-modal-text">
                    Refine por status, cliente e ordenação.
                  </p>
                </div>

                <button
                  type="button"
                  className="saved-page__filter-modal-close"
                  onClick={() => setIsFilterModalOpen(false)}
                  aria-label="Fechar filtros"
                >
                  <X size={18} strokeWidth={2} aria-hidden />
                </button>
              </div>

              <div className="saved-page__filter-grid">
                <label className="saved-page__filter">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as 'todos' | SavedProposalStatus)
                    }
                  >
                    <option value="todos">Todos</option>
                    {SAVED_PROPOSAL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="saved-page__filter">
                  <span>Cliente</span>
                  <select
                    value={clientFilter}
                    onChange={(event) => setClientFilter(event.target.value)}
                  >
                    <option value="todos">Todos</option>
                    {clients.map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="saved-page__filter">
                  <span>Data de edição</span>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  >
                    <option value="recentes">Mais recentes</option>
                    <option value="antigas">Mais antigas</option>
                    <option value="maior-valor">Maior valor</option>
                    <option value="menor-valor">Menor valor</option>
                    <option value="cliente">Cliente A-Z</option>
                  </select>
                </label>
              </div>

              <div className="saved-page__filter-modal-footer">
                <Button
                  variant="secondary"
                  onClick={resetAdvancedFilters}
                  disabled={activeAdvancedFilterCount === 0}
                >
                  Limpar filtros
                </Button>
                <Button variant="primary" onClick={() => setIsFilterModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <ViewModeToggle
          className="saved-page__view-toggle"
          value={viewMode}
          onChange={setViewMode}
        />
      </div>
    </section>
  )
}
