import type { Dispatch, SetStateAction } from 'react'
import { ChevronDown, Filter, Search } from 'lucide-react'
import type { RoleFilter } from '@/pages/users/lib/usersPageLib'

export function UsersToolbar({
  query,
  setQuery,
  roleFilter,
  setRoleFilter,
}: {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  roleFilter: RoleFilter
  setRoleFilter: Dispatch<SetStateAction<RoleFilter>>
}) {
  return (
    <div className="users-page__toolbar">
      <div className="users-page__search">
        <Search
          size={18}
          strokeWidth={2}
          className="users-page__search-icon"
          aria-hidden
        />
        <input
          type="search"
          className="users-page__search-input"
          placeholder="Buscar por nome ou email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="users-page__filter-wrap">
        <Filter
          size={16}
          strokeWidth={2}
          className="users-page__filter-icon"
          aria-hidden
        />
        <select
          className="users-page__filter"
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as RoleFilter)
          }
          aria-label="Filtrar por perfil"
        >
          <option value="all">Todos os usuários</option>
          <option value="admin">Administradores</option>
          <option value="user">Usuários</option>
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="users-page__filter-chevron"
          aria-hidden
        />
      </div>
    </div>
  )
}
