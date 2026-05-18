import { Trash2 } from 'lucide-react'
import type { AccessGroup } from '@/features/access-groups/types'
import type { AuthUser, StoredUser } from '@/features/auth/types'
import { normalizeUserGroupIds } from '@/features/auth/groupIds'
import { initialsFromName } from '@/utils/strings'
import {
  formatDatePt,
  formatTimePt,
  isActiveInWindow,
  paletteForId,
  accessGroupsParticipatedSorted,
} from '@/pages/users/lib/usersPageLib'

export function UsersTable({
  filtered,
  accessGroups,
  sessionUser,
  selectedIds,
  adminCount,
  allFilteredSelected,
  someFilteredSelected,
  toggleSelectAllFiltered,
  toggleRowSelected,
  handleToggleAdmin,
  handleRemove,
}: {
  filtered: StoredUser[]
  accessGroups: AccessGroup[]
  sessionUser: AuthUser | null
  selectedIds: Set<string>
  adminCount: number
  allFilteredSelected: boolean
  someFilteredSelected: boolean
  toggleSelectAllFiltered: () => void
  toggleRowSelected: (id: string) => void
  handleToggleAdmin: (target: StoredUser, nextAdmin: boolean) => void
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
            <th className="users-page__th users-page__th--group">Grupo</th>
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
            const switchDisabled = u.isAdmin && adminCount <= 1
            const groupsWithMeta = accessGroupsParticipatedSorted(
              u,
              accessGroups,
            )
            const catalogIdSet = new Set(accessGroups.map((g) => g.id))
            const orphanIds = normalizeUserGroupIds(u).filter(
              (id) => !catalogIdSet.has(id),
            )
            const labelParts = [
              ...groupsWithMeta.map((g) => g.name),
              ...orphanIds,
            ]
            const labelNames =
              labelParts.length > 0 ? labelParts.join(', ') : ''
            const activeNow = isActiveInWindow(u, Date.now())

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
                <td className="users-page__td users-page__td--group">
                  {!groupsWithMeta.length && !orphanIds.length ? (
                    <span
                      className="users-page__group-label users-page__group-label--none"
                      aria-label={`Grupo de ${u.name}: não participa de nenhum grupo cadastrado`}
                    >
                      Não participa de nenhum grupo
                    </span>
                  ) : (
                    <div
                      className="users-page__group-chips"
                      role="group"
                      aria-label={`Grupo de ${u.name}: ${labelNames}`}
                    >
                      {groupsWithMeta.map((g) => (
                        <span
                          key={g.id}
                          className={`users-page__group-label users-page__group-label--${g.color}`}
                        >
                          {g.name}
                        </span>
                      ))}
                      {orphanIds.length > 0 ? (
                        <span
                          className="users-page__group-label users-page__group-label--ghost"
                          title={orphanIds.join(', ')}
                        >
                          {orphanIds.length === 1
                            ? 'Referência órfã'
                            : `${orphanIds.length} referências órfãs`}
                        </span>
                      ) : null}
                    </div>
                  )}
                </td>
                <td className="users-page__td users-page__td--status">
                  <span
                    className={
                      activeNow
                        ? 'users-page__status users-page__status--on'
                        : 'users-page__status users-page__status--off'
                    }
                  >
                    <span className="users-page__status-dot" aria-hidden />
                    {activeNow ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="users-page__td users-page__td--profile">
                  <div className="users-page__profile-cell">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={u.isAdmin}
                      disabled={switchDisabled}
                      title={
                        switchDisabled
                          ? 'Mantenha pelo menos um administrador.'
                          : u.isAdmin
                            ? 'Alternar para usuário'
                            : 'Alternar para administrador'
                      }
                      className={`users-page__switch${u.isAdmin ? ' users-page__switch--on' : ''}`}
                      onClick={() => handleToggleAdmin(u, !u.isAdmin)}
                    >
                      <span className="users-page__switch-thumb" />
                    </button>
                    <span
                      className={`users-page__badge${u.isAdmin ? ' users-page__badge--admin' : ' users-page__badge--user'}`}
                    >
                      {u.isAdmin ? 'Admin' : 'Usuário'}
                    </span>
                  </div>
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
