import {
  TABS,
  type SortId,
  type TemplateTabId,
} from '@/pages/proposal-templates/lib/proposalTemplatesPageLib'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'

export function ProposalTemplatesToolbar({
  tab,
  setTab,
  sort,
  setSort,
  view,
  setView,
}: {
  tab: TemplateTabId
  setTab: (id: TemplateTabId) => void
  sort: SortId
  setSort: (id: SortId) => void
  view: 'grid' | 'list'
  setView: (v: 'grid' | 'list') => void
}) {
  return (
    <div className="proposal-templates-page__toolbar">
      <div
        className="proposal-templates-page__tabs"
        role="tablist"
        aria-label="Categorias de modelos"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={
              tab === id
                ? 'proposal-templates-page__tab proposal-templates-page__tab--active'
                : 'proposal-templates-page__tab'
            }
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="proposal-templates-page__toolbar-right">
        <div className="proposal-templates-page__sort">
          <span>Ordenar por:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            aria-label="Ordenar modelos"
          >
            <option value="mais-utilizados">Mais utilizados</option>
            <option value="recentes">Último uso</option>
            <option value="nome">Nome (A–Z)</option>
          </select>
        </div>
        <ViewModeToggle value={view} onChange={setView} />
      </div>
    </div>
  )
}
