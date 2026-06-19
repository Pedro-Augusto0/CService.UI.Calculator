import type { Dispatch, SetStateAction } from 'react'
import { ChevronDown, Filter, Search } from 'lucide-react'

export type ClientStatusFilter = 'active' | 'all'

export function ClientsToolbar({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
}: {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  statusFilter: ClientStatusFilter
  setStatusFilter: Dispatch<SetStateAction<ClientStatusFilter>>
}) {
  return (
    <div className="clients-page__toolbar">
      <div className="clients-page__search">
        <Search
          size={18}
          strokeWidth={2}
          className="clients-page__search-icon"
          aria-hidden
        />
        <input
          type="search"
          className="clients-page__search-input"
          placeholder="Buscar por nome..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="clients-page__filter-wrap">
        <Filter
          size={16}
          strokeWidth={2}
          className="clients-page__filter-icon"
          aria-hidden
        />
        <select
          className="clients-page__filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ClientStatusFilter)
          }
          aria-label="Filtrar por status"
        >
          <option value="active">Clientes ativos</option>
          <option value="all">Todos os clientes</option>
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="clients-page__filter-chevron"
          aria-hidden
        />
      </div>
    </div>
  )
}
