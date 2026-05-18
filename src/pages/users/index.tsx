import { useUsersPage } from '@/pages/users/hooks/useUsersPage'
import { UsersSummaryCards } from '@/pages/users/components/UsersSummaryCards'
import { UsersTable } from '@/pages/users/components/UsersTable'
import { UsersToolbar } from '@/pages/users/components/UsersToolbar'
import './Users.css'

export function Users() {
  const p = useUsersPage()

  return (
    <div className="users-page">
      <header className="users-page__header">
        <h1 className="users-page__title">Usuários</h1>
        <p className="users-page__subtitle">
          Gerencie os usuários e permissões de acesso à plataforma.
        </p>
      </header>

      <UsersSummaryCards stats={p.stats} />

      <UsersToolbar
        query={p.query}
        setQuery={p.setQuery}
        roleFilter={p.roleFilter}
        setRoleFilter={p.setRoleFilter}
      />

      <UsersTable
        filtered={p.filtered}
        accessGroups={p.accessGroups}
        sessionUser={p.sessionUser}
        selectedIds={p.selectedIds}
        adminCount={p.adminCount}
        allFilteredSelected={p.allFilteredSelected}
        someFilteredSelected={p.someFilteredSelected}
        toggleSelectAllFiltered={p.toggleSelectAllFiltered}
        toggleRowSelected={p.toggleRowSelected}
        handleGroupChange={p.handleGroupChange}
        handleToggleAdmin={p.handleToggleAdmin}
        handleRemove={p.handleRemove}
      />
    </div>
  )
}
