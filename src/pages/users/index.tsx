import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  Shield,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import type { StoredUser } from '@/features/auth/types'
import { loadUsers, saveUsers } from '@/features/auth/api/userStorage'
import { initialsFromName } from '@/utils/strings'
import './Users.css'

const MS_DAY = 24 * 60 * 60 * 1000
const ACTIVE_WINDOW_MS = 30 * MS_DAY

const AVATAR_PALETTES = [
  { bg: '#3b82f6', fg: '#fff' },
  { bg: '#ec4899', fg: '#fff' },
  { bg: '#06b6d4', fg: '#fff' },
  { bg: '#8b5cf6', fg: '#fff' },
  { bg: '#14b8a6', fg: '#fff' },
] as const

type RoleFilter = 'all' | 'admin' | 'user'

function paletteForId(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * 17) % 997
  return AVATAR_PALETTES[h % AVATAR_PALETTES.length]
}

function activityTimestamp(u: StoredUser): number {
  return u.lastLoginAt ?? u.createdAt
}

function isActiveInWindow(u: StoredUser, now: number): boolean {
  return now - activityTimestamp(u) <= ACTIVE_WINDOW_MS
}

function formatDatePt(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

function formatTimePt(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function Users() {
  const { user: sessionUser, refreshSessionUser } = useAuth()
  const [rows, setRows] = useState<StoredUser[]>(() => loadUsers())
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setSelectedIds(new Set())
  }, [query, roleFilter])

  const reload = useCallback(() => {
    setRows(loadUsers())
    refreshSessionUser()
  }, [refreshSessionUser])

  const stats = useMemo(() => {
    const t = Date.now()
    const total = rows.length
    const admins = rows.filter((u) => u.isAdmin).length
    const active = rows.filter((u) => isActiveInWindow(u, t)).length
    return { total, admins, active }
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((u) => {
      if (roleFilter === 'admin' && !u.isAdmin) return false
      if (roleFilter === 'user' && u.isAdmin) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
  }, [rows, query, roleFilter])

  const adminCount = useMemo(
    () => rows.filter((u) => u.isAdmin).length,
    [rows],
  )

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.has(u.id))

  const someFilteredSelected = filtered.some((u) => selectedIds.has(u.id))

  const persist = useCallback(
    (next: StoredUser[]) => {
      saveUsers(next)
      reload()
      setSelectedIds(new Set())
    },
    [reload],
  )

  const handleToggleAdmin = useCallback(
    (target: StoredUser, nextAdmin: boolean) => {
      if (!sessionUser) return
      if (target.isAdmin === nextAdmin) return

      if (target.isAdmin && !nextAdmin && adminCount <= 1) {
        window.alert(
          'É necessário manter pelo menos um administrador na plataforma.',
        )
        return
      }

      const next = rows.map((u) =>
        u.id === target.id ? { ...u, isAdmin: nextAdmin } : u,
      )
      persist(next)
    },
    [sessionUser, adminCount, rows, persist],
  )

  const handleRemove = useCallback(
    (target: StoredUser) => {
      if (!sessionUser) return
      if (target.id === sessionUser.id) {
        window.alert('Não é possível remover o seu próprio usuário.')
        return
      }
      if (
        !window.confirm(
          `Remover o usuário ${target.name} (${target.email})? Esta ação não pode ser desfeita.`,
        )
      ) {
        return
      }
      const next = rows.filter((u) => u.id !== target.id)
      persist(next)
    },
    [sessionUser, rows, persist],
  )

  const toggleSelectAllFiltered = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(filtered.map((u) => u.id)))
  }, [allFilteredSelected, filtered])

  const toggleRowSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className="users-page">
      <header className="users-page__header">
        <h1 className="users-page__title">Usuários</h1>
        <p className="users-page__subtitle">
          Gerencie os usuários e permissões de acesso à plataforma.
        </p>
      </header>

      <section className="users-page__cards" aria-label="Resumo">
        <article className="users-page__card">
          <div
            className="users-page__card-icon users-page__card-icon--users"
            aria-hidden
          >
            <UsersIcon size={22} strokeWidth={2} />
          </div>
          <div className="users-page__card-body">
            <div className="users-page__card-label">Total de usuários</div>
            <div className="users-page__card-value">{stats.total}</div>
            <div className="users-page__card-hint">
              Todos os usuários cadastrados
            </div>
          </div>
        </article>
        <article className="users-page__card">
          <div
            className="users-page__card-icon users-page__card-icon--admin"
            aria-hidden
          >
            <Shield size={22} strokeWidth={2} />
          </div>
          <div className="users-page__card-body">
            <div className="users-page__card-label">Administradores</div>
            <div className="users-page__card-value">{stats.admins}</div>
            <div className="users-page__card-hint">
              Com acesso de administrador
            </div>
          </div>
        </article>
        <article className="users-page__card">
          <div
            className="users-page__card-icon users-page__card-icon--active"
            aria-hidden
          >
            <CheckCircle2 size={22} strokeWidth={2} />
          </div>
          <div className="users-page__card-body">
            <div className="users-page__card-label">Usuários ativos</div>
            <div className="users-page__card-value">{stats.active}</div>
            <div className="users-page__card-hint">
              Ativos nos últimos 30 dias
            </div>
          </div>
        </article>
      </section>

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
              <th className="users-page__th">Email</th>
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
                  <td className="users-page__td users-page__td--email">
                    {u.email}
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
    </div>
  )
}
