import { Pencil, Trash2 } from 'lucide-react'
import type { AuthUser, StoredUser } from '@/features/auth/types'
import { initialsFromName } from '@/utils/strings'
import {
  formatDatePt,
  formatTimePt,
  isActiveInWindow,
  paletteForId,
} from '@/pages/users/lib/usersPageLib'

export function UsersTable({
  filtered,
  sessionUser,
  selectedIds,
  canManageUsers,
  allFilteredSelected,
  someFilteredSelected,
  toggleSelectAllFiltered,
  toggleRowSelected,
  onEdit,
  handleRemove,
}: {
  filtered: StoredUser[]
  sessionUser: AuthUser | null
  selectedIds: Set<string>
  canManageUsers: boolean
  allFilteredSelected: boolean
  someFilteredSelected: boolean
  toggleSelectAllFiltered: () => void
  toggleRowSelected: (id: string) => void
  onEdit: (target: StoredUser) => void
  handleRemove: (target: StoredUser) => void
}) {
  return (
    <div className="users-page__table-shell">
      <table className="users-page__table">
        <thead>
          <tr>
            <th className="users-page__th users-page__th--check">
              <input
                type="checkbox"
                className="users-page__checkbox"
                checked={allFilteredSelected}
                ref={(el) => {
                  if (el)
                    el.indeterminate =
                      !allFilteredSelected && someFilteredSelected
                }}
                onChange={toggleSelectAllFiltered}
                aria-label="Selecionar todos"
              />
            </th>
            <th className="users-page__th">Usuário</th>
            <th className="users-page__th users-page__th--status">Status</th>
            <th className="users-page__th">Perfil</th>
            <th className="users-page__th">Criado em</th>
            <th className="users-page__th users-page__th--actions">
              <span className="users-page__sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const created = new Date(u.createdAt)
            const pal = paletteForId(u.id)
            const accountActive =
              u.isActive === false ? false : isActiveInWindow(u, Date.now())

            return (
              <tr key={u.id} className="users-page__row">
                <td className="users-page__td users-page__td--check">
                  <input
                    type="checkbox"
                    className="users-page__checkbox"
                    checked={selectedIds.has(u.id)}
                    onChange={() => toggleRowSelected(u.id)}
                    aria-label={`Selecionar ${u.name}`}
                  />
                </td>
                <td className="users-page__td users-page__td--user">
                  <div className="users-page__user-cell">
                    <div
                      className="users-page__avatar"
                      style={{
                        background: pal.bg,
                        color: pal.fg,
                      }}
                      aria-hidden
                    >
                      {initialsFromName(u.name)}
                    </div>
                    <div className="users-page__user-text">
                      <div className="users-page__user-name">{u.name}</div>
                      <div className="users-page__user-email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="users-page__td users-page__td--status">
                  <span
                    className={
                      accountActive
                        ? 'users-page__status users-page__status--on'
                        : 'users-page__status users-page__status--off'
                    }
                  >
                    <span className="users-page__status-dot" aria-hidden />
                    {u.isActive === false
                      ? 'Inativo'
                      : accountActive
                        ? 'Ativo'
                        : 'Inativo'}
                  </span>
                </td>
                <td className="users-page__td users-page__td--profile">
                  <span
                    className={`users-page__badge${
                      u.isMasterAdmin
                        ? ' users-page__badge--master'
                        : u.isAdmin
                          ? ' users-page__badge--admin'
                          : ' users-page__badge--user'
                    }`}
                  >
                    {u.isMasterAdmin
                      ? 'Master admin'
                      : u.isAdmin
                        ? 'Admin'
                        : 'Usuário'}
                  </span>
                </td>
                <td className="users-page__td users-page__td--date">
                  <div className="users-page__date-line">
                    {formatDatePt(created)}
                  </div>
                  <div className="users-page__time-line">
                    {formatTimePt(created)}
                  </div>
                </td>
                <td className="users-page__td users-page__td--actions">
                  {canManageUsers ? (
                    <div className="users-page__actions">
                      <button
                        type="button"
                        className="users-page__edit"
                        title="Editar usuário"
                        onClick={() => onEdit(u)}
                      >
                        <Pencil size={18} strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        className="users-page__remove"
                        disabled={u.id === sessionUser?.id}
                        title={
                          u.id === sessionUser?.id
                            ? 'Você não pode remover a si mesmo.'
                            : 'Remover usuário'
                        }
                        onClick={() => handleRemove(u)}
                      >
                        <Trash2 size={18} strokeWidth={1.9} />
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {filtered.length === 0 ? (
        <p className="users-page__empty">Nenhum usuário encontrado.</p>
      ) : null}
    </div>
  )
}
