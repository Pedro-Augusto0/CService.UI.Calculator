import { useUsersPage } from '@/pages/users/hooks/useUsersPage'
import { CreateUserModal } from '@/pages/users/components/CreateUserModal'
import { EditUserModal } from '@/pages/users/components/EditUserModal'
import { UsersSummaryCards } from '@/pages/users/components/UsersSummaryCards'
import { UsersTable } from '@/pages/users/components/UsersTable'
import { UsersToolbar } from '@/pages/users/components/UsersToolbar'
import { UserPlus } from 'lucide-react'
import './Users.css'

export function Users() {
  const p = useUsersPage()

  return (
    <div className="users-page">
      <header className="users-page__header">
        <div className="users-page__header-text">
          <h1 className="users-page__title">Usuários</h1>
          <p className="users-page__subtitle">
            Gerencie os usuários da plataforma.
          </p>
        </div>
        {p.canManageUsers ? (
          <button
            type="button"
            className="users-page__create-btn"
            onClick={p.openCreateModal}
          >
            <UserPlus size={18} strokeWidth={2} aria-hidden />
            Novo usuário
          </button>
        ) : null}
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
        sessionUser={p.sessionUser}
        selectedIds={p.selectedIds}
        canManageUsers={p.canManageUsers}
        allFilteredSelected={p.allFilteredSelected}
        someFilteredSelected={p.someFilteredSelected}
        toggleSelectAllFiltered={p.toggleSelectAllFiltered}
        toggleRowSelected={p.toggleRowSelected}
        onEdit={p.openEditModal}
        handleRemove={p.handleRemove}
      />

      <CreateUserModal
        open={p.createOpen}
        busy={p.createBusy}
        error={p.createError}
        onClose={p.closeCreateModal}
        onSubmit={p.handleCreateUser}
      />

      <EditUserModal
        user={p.editUser}
        busy={p.editBusy}
        error={p.editError}
        onClose={p.closeEditModal}
        onSubmit={p.handleEditUser}
      />
    </div>
  )
}
