import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  X,
} from 'lucide-react'
import type { AccessGroup } from '@/features/access-groups/types'
import type { StoredUser } from '@/features/auth/types'
import { Button } from '@/components/ui/Button'
import { GroupIconBox } from '@/pages/access-groups/components/GroupIconBox'
import { COLOR_STYLES } from '@/pages/access-groups/lib/accessGroupsLib'
import type { EditorMode } from '@/pages/access-groups/hooks/useAccessGroupsPage'
import { normalizeUserGroupIds } from '@/features/auth/groupIds'
import { initialsFromName } from '@/utils/strings'
import { paletteForId } from '@/pages/users/lib/usersPageLib'

const PAGE_SIZE = 8

function userRoleBadge(
  u: StoredUser,
  accessGroupsSorted: AccessGroup[],
): { label: string; colorKey: keyof typeof COLOR_STYLES } {
  if (u.isAdmin) return { label: 'Admin', colorKey: 'blue' }
  const memberships = accessGroupsSorted
    .filter((g) => normalizeUserGroupIds(u).includes(g.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const first = memberships[0]
  if (!first) return { label: 'Sem grupo', colorKey: 'grey' }
  if (memberships.length === 1) {
    return { label: first.name, colorKey: first.color }
  }
  const extra = memberships.length - 1
  return {
    label: `${first.name} (+${extra} ${extra === 1 ? 'outro' : 'outros'})`,
    colorKey: first.color,
  }
}

export function AccessGroupUsersPanel({
  mode,
  draftName,
  draftDescription,
  draftColor,
  draftIconKey,
  draftActive,
  permissionGrantedCount,
  accessGroupsSorted,
  assignedUsers,
  allUsersSnapshot,
  onAssignUsers,
  onRemoveUsers,
  onRemoveAllFromGroup,
  onNavigateToPermissions,
}: {
  mode: Exclude<EditorMode, 'list'>
  draftName: string
  draftDescription: string
  draftColor: AccessGroup['color']
  draftIconKey: AccessGroup['iconKey']
  draftActive: boolean
  permissionGrantedCount: number
  accessGroupsSorted: AccessGroup[]
  assignedUsers: StoredUser[]
  allUsersSnapshot: StoredUser[]
  onAssignUsers: (userIds: string[]) => void
  onRemoveUsers: (userIds: string[]) => void
  onRemoveAllFromGroup: () => void
  onNavigateToPermissions: () => void
}) {
  const [leftSearch, setLeftSearch] = useState('')
  const [poolSearch, setPoolSearch] = useState('')
  const [poolGroupFilterId, setPoolGroupFilterId] = useState<string>('all')
  const [selectedOnLeftIds, setSelectedOnLeftIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [poolSelectedIds, setPoolSelectedIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [poolPage, setPoolPage] = useState(0)

  const assignedIds = useMemo(
    () => new Set(assignedUsers.map((u) => u.id)),
    [assignedUsers],
  )

  const leftFiltered = useMemo(() => {
    const q = leftSearch.trim().toLowerCase()
    let rows = [...assignedUsers]
    if (q.length) {
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }
    rows.sort((a, b) => a.name.localeCompare(b.name, 'pt'))
    return rows
  }, [assignedUsers, leftSearch])

  const poolBase = useMemo(() => {
    return allUsersSnapshot.filter((u) => !assignedIds.has(u.id))
  }, [allUsersSnapshot, assignedIds])

  const poolFiltered = useMemo(() => {
    let rows = [...poolBase]
    if (poolGroupFilterId !== 'all') {
      rows = rows.filter((u) =>
        normalizeUserGroupIds(u).includes(poolGroupFilterId),
      )
    }
    const q = poolSearch.trim().toLowerCase()
    if (q.length) {
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }
    rows.sort((a, b) => a.name.localeCompare(b.name, 'pt'))
    return rows
  }, [poolBase, poolGroupFilterId, poolSearch])

  const poolPages =
    poolFiltered.length === 0 ? 0 : Math.ceil(poolFiltered.length / PAGE_SIZE)
  const poolPageSafe =
    poolPages === 0 ? 0 : Math.min(poolPage, poolPages - 1)

  const poolPageRows = useMemo(() => {
    const start = poolPageSafe * PAGE_SIZE
    return poolFiltered.slice(start, start + PAGE_SIZE)
  }, [poolFiltered, poolPageSafe])

  function togglePoolRow(id: string) {
    setPoolSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleLeftRowSelection(id: string) {
    setSelectedOnLeftIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddSelected() {
    const ids = [...poolSelectedIds]
    if (!ids.length) return
    onAssignUsers(ids)
    setPoolSelectedIds(new Set())
  }

  function handleRemoveViaMiddleButton() {
    const ids = [...selectedOnLeftIds]
    if (!ids.length) return
    onRemoveUsers(ids)
    setSelectedOnLeftIds(new Set())
  }

  function removeOne(userId: string) {
    onRemoveUsers([userId])
    setSelectedOnLeftIds((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
    setPoolSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
  }

  const immediateChanges = mode !== 'new'
  const bannerText = immediateChanges
    ? 'As alterações são aplicadas imediatamente.'
    : 'As atribuições de usuários serão gravadas ao salvar ou criar o grupo.'

  return (
    <div className="access-groups__transfer-scope">
      <section className="access-groups__transfer-card">
        <header className="access-groups__transfer-head">
          <div>
            <h2 className="access-groups__transfer-title">
              Gerenciar usuários do grupo
            </h2>
            <p className="access-groups__transfer-sub">
              Adicione ou remova usuários deste grupo de acesso.
            </p>
          </div>
        </header>

        <div className="access-groups__transfer-alert" role="status">
          <Info
            size={18}
            strokeWidth={2}
            aria-hidden
            className="access-groups__transfer-alert-icon"
          />
          <p>{bannerText}</p>
        </div>

        <div className="access-groups__transfer-grid">
          <div className="access-groups__transfer-col">
            <div className="access-groups__transfer-col-head">
              <span className="access-groups__transfer-col-title">
                Usuários neste grupo ({assignedUsers.length})
              </span>
            </div>
            <label className="access-groups__transfer-search">
              <Search size={17} aria-hidden strokeWidth={2} />
              <input
                type="search"
                value={leftSearch}
                onChange={(e) => setLeftSearch(e.target.value)}
                placeholder="Buscar usuário..."
                aria-label="Buscar entre usuários do grupo"
              />
            </label>
            <ul className="access-groups__transfer-list">
              {leftFiltered.map((u) => {
                const pal = paletteForId(u.id)
                const badge = userRoleBadge(u, accessGroupsSorted)
                const styles = COLOR_STYLES[badge.colorKey]
                const selectedLeft = selectedOnLeftIds.has(u.id)
                return (
                  <li key={u.id}>
                    <div
                      className={`access-groups__transfer-row access-groups__transfer-row--interactive${selectedLeft ? ' access-groups__transfer-row--selected' : ''}`}
                    >
                      <button
                        type="button"
                        className="access-groups__transfer-row-hit"
                        onClick={() => toggleLeftRowSelection(u.id)}
                      >
                        <span
                          className="access-groups__transfer-avatar"
                          style={{ background: pal.bg, color: pal.fg }}
                          aria-hidden
                        >
                          {initialsFromName(u.name)}
                        </span>
                        <span className="access-groups__transfer-user-text">
                          <span className="access-groups__transfer-user-name">
                            {u.name}
                          </span>
                          <span className="access-groups__transfer-user-email">
                            {u.email}
                          </span>
                        </span>
                        <span
                          className="access-groups__transfer-badge"
                          style={{
                            background: styles.soft,
                            color:
                              badge.label === 'Admin' ? '#1d4ed8' : styles.bg,
                          }}
                        >
                          {badge.label}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="access-groups__transfer-row-remove"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeOne(u.id)
                        }}
                        aria-label={`Remover ${u.name} do grupo`}
                      >
                        <X size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
            {!leftFiltered.length ? (
              <p className="access-groups__transfer-list-empty">
                Nenhum usuário para exibir.
              </p>
            ) : null}
            <div className="access-groups__transfer-footer">
              <span>
                {assignedUsers.length === 1
                  ? '1 usuário'
                  : `${assignedUsers.length} usuários`}
              </span>
              <button
                type="button"
                className="access-groups__transfer-link-btn"
                onClick={() => {
                  if (assignedUsers.length === 0) return
                  if (
                    window.confirm(
                      'Remover todos os usuários deste grupo?',
                    )
                  )
                    onRemoveAllFromGroup()
                  setSelectedOnLeftIds(new Set())
                }}
                disabled={assignedUsers.length === 0}
              >
                Remover todos
              </button>
            </div>
          </div>

          <div className="access-groups__transfer-actions" aria-hidden={false}>
          <Button
              variant="secondary"
              className="access-groups__transfer-action-btn"
              onClick={handleAddSelected}
              disabled={poolSelectedIds.size === 0}
              aria-label="Adicionar usuários selecionados ao grupo"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </Button>
            <Button
              variant="secondary"
              className="access-groups__transfer-action-btn"
              onClick={() => handleRemoveViaMiddleButton()}
              disabled={
                assignedIds.size === 0 || selectedOnLeftIds.size === 0
              }
              title={
                assignedIds.size
                ? 'Selecione usuários na lista à esquerda clicando sobre eles.'
                : ''
              }
              aria-label="Remover usuários do grupo"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </Button>
           
          </div>

          <div className="access-groups__transfer-col">
            <div className="access-groups__transfer-col-head">
              <span className="access-groups__transfer-col-title">
                Todos os usuários ({poolBase.length})
              </span>
            </div>
            <label className="access-groups__transfer-search">
              <Search size={17} aria-hidden strokeWidth={2} />
              <input
                type="search"
                value={poolSearch}
                onChange={(e) => {
                  setPoolSearch(e.target.value)
                  setPoolPage(0)
                }}
                placeholder="Buscar usuário..."
                aria-label="Buscar usuários disponíveis"
              />
            </label>
            <div className="access-groups__transfer-filter-row">
              <select
                className="access-groups__transfer-filter-select"
                value={poolGroupFilterId}
                onChange={(e) => {
                  setPoolGroupFilterId(e.target.value)
                  setPoolPage(0)
                }}
                aria-label="Filtrar por grupo atual"
              >
                <option value="all">Todos os grupos</option>
                {accessGroupsSorted.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <ul className="access-groups__transfer-list access-groups__transfer-list--scroll">
              {poolPageRows.map((u) => {
                const pal = paletteForId(u.id)
                const badge = userRoleBadge(u, accessGroupsSorted)
                const styles = COLOR_STYLES[badge.colorKey]
                const checked = poolSelectedIds.has(u.id)
                return (
                  <li key={u.id}>
                    <label className="access-groups__transfer-row access-groups__transfer-row--checkbox">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePoolRow(u.id)}
                        aria-label={`Selecionar ${u.name}`}
                        className="access-groups__transfer-check"
                      />
                      <span
                        className="access-groups__transfer-avatar access-groups__transfer-avatar--sm"
                        style={{ background: pal.bg, color: pal.fg }}
                        aria-hidden
                      >
                        {initialsFromName(u.name)}
                      </span>
                      <span className="access-groups__transfer-user-text">
                        <span className="access-groups__transfer-user-name">
                          {u.name}
                        </span>
                        <span className="access-groups__transfer-user-email">
                          {u.email}
                        </span>
                      </span>
                      <span
                        className="access-groups__transfer-badge access-groups__transfer-badge--narrow"
                        style={{
                          background: styles.soft,
                          color:
                            badge.label === 'Admin' ? '#1d4ed8' : styles.bg,
                        }}
                      >
                        {badge.label}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {!poolFiltered.length ? (
              <p className="access-groups__transfer-list-empty">
                Nenhum usuário disponível com os filtros atuais.
              </p>
            ) : null}
            <div className="access-groups__transfer-footer access-groups__transfer-footer--spread">
              <span>
                {poolSelectedIds.size === 1
                  ? '1 selecionado'
                  : `${poolSelectedIds.size} selecionados`}
              </span>
              <div className="access-groups__transfer-pager">
                <button
                  type="button"
                  className="access-groups__transfer-pager-btn"
                  disabled={poolFiltered.length === 0 || poolPages === 0}
                  onClick={() => setPoolPage((p) => Math.max(0, p - 1))}
                >
                  Anterior
                </button>
                <span className="access-groups__transfer-pager-meta">
                  Página{' '}
                  <strong>
                    {poolFiltered.length === 0 ? '—' : poolPageSafe + 1}
                  </strong>
                  {' de '}
                  <strong>{poolPages === 0 ? '—' : poolPages}</strong>
                </span>
                <button
                  type="button"
                  className="access-groups__transfer-pager-btn"
                  disabled={
                    poolFiltered.length === 0 ||
                    poolPages === 0 ||
                    poolPageSafe >= poolPages - 1
                  }
                  onClick={() =>
                    setPoolPage((p) =>
                      poolPages <= 1 ? p : Math.min(poolPages - 1, p + 1),
                    )
                  }
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>

      <footer className="access-groups__summary-bar">
        <div className="access-groups__summary-bar-main">
          <GroupIconBox
            color={draftColor}
            iconKey={draftIconKey}
            size="lg"
            variant="table"
          />
          <div className="access-groups__summary-bar-text">
            <span className="access-groups__summary-bar-title">
              {draftName.trim() || 'Sem nome'}{' '}
              <span
                className={`access-groups__summary-bar-status${draftActive ? '' : ' access-groups__summary-bar-status--off'}`}
              >
                {draftActive ? 'ativo' : 'inativo'}
              </span>
            </span>
            <span className="access-groups__summary-bar-desc">
              {draftDescription.trim() ||
                'Defina uma descrição na aba Informações.'}
            </span>
          </div>
        </div>
        <div className="access-groups__summary-bar-metrics">
          <div>
            <span className="access-groups__summary-bar-metric-num">
              {assignedUsers.length}
            </span>
            <span className="access-groups__summary-bar-metric-label">
              Usuários neste grupo
            </span>
          </div>
          <div>
            <span className="access-groups__summary-bar-metric-num">
              {permissionGrantedCount}
            </span>
            <span className="access-groups__summary-bar-metric-label">
              Permissões concedidas
            </span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => onNavigateToPermissions()}>
          Ver permissões
        </Button>
      </footer>
    </div>
  )
}
