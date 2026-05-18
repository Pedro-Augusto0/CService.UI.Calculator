import { LayoutGrid, List } from 'lucide-react'
import {
  TABS,
  type SortId,
  type TemplateTabId,
} from '@/pages/proposal-templates/lib/proposalTemplatesPageLib'

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
        <div
          className="proposal-templates-page__view-toggle"
          role="group"
          aria-label="Modo de visualização"
        >
          <button
            type="button"
            className={
              view === 'grid'
                ? 'proposal-templates-page__view-btn proposal-templates-page__view-btn--active'
                : 'proposal-templates-page__view-btn'
            }
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Grade"
          >
            <LayoutGrid size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={
              view === 'list'
                ? 'proposal-templates-page__view-btn proposal-templates-page__view-btn--active'
                : 'proposal-templates-page__view-btn'
            }
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            aria-label="Lista"
          >
            <List size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
