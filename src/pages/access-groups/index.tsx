import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Check,
  CircleDollarSign,
  CirclePlus,
  Eye,
  FileText,
  Filter,
  Info,
  LayoutGrid,
  LayoutList,
  MoreVertical,
  Search,
  Settings2,
  Shield,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type {
  AccessGroup,
  GroupColor,
  GroupIconKey,
  PermissionCardIcon,
} from '@/features/access-groups/types'
import {
  loadAccessGroups,
  saveAccessGroups,
} from '@/features/access-groups/accessGroupStorage'
import {
  getAllPermissionIds,
  PERMISSION_MODULES,
} from '@/features/access-groups/permissions'
import type { StoredUser } from '@/features/auth/types'
import { loadUsers } from '@/features/auth/api/userStorage'
import './AccessGroups.css'

const ALL_IDS = getAllPermissionIds()
const DESCRIPTION_MAX = 200

const GROUP_COLORS_ORDER: GroupColor[] = [
  'purple',
  'blue',
  'teal',
  'green',
  'orange',
  'pink',
  'grey',
]

function newGroupId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  return `grp-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`
}

const ICON_MAP = {
  shield: Shield,
  briefcase: Briefcase,
  settings: Settings2,
  eye: Eye,
} as const

const CARD_ICON_MAP: Record<
  PermissionCardIcon,
  ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  'file-text': FileText,
  users: Users,
  'layout-grid': LayoutGrid,
  'circle-dollar-sign': CircleDollarSign,
  'bar-chart-3': BarChart3,
  shield: Shield,
}

const COLOR_STYLES: Record<
  GroupColor,
  { bg: string; fg: string; soft: string }
> = {
  purple: { bg: '#7c3aed', fg: '#fff', soft: '#ede9fe' },
  blue: { bg: '#2563eb', fg: '#fff', soft: '#dbeafe' },
  teal: { bg: '#0d9488', fg: '#fff', soft: '#ccfbf1' },
  green: { bg: '#16a34a', fg: '#fff', soft: '#dcfce7' },
  orange: { bg: '#ea580c', fg: '#fff', soft: '#ffedd5' },
  pink: { bg: '#db2777', fg: '#fff', soft: '#fce7f3' },
  grey: { bg: '#475569', fg: '#fff', soft: '#e2e8f0' },
}

function GroupIconBox({
  color,
  iconKey,
  size = 'md',
  variant = 'table',
}: {
  color: GroupColor
  iconKey: GroupIconKey
  size?: 'sm' | 'md' | 'lg' | 'list'
  variant?: 'table' | 'editor'
}) {
  const Icon = variant === 'editor' ? Shield : ICON_MAP[iconKey]
  const palette = COLOR_STYLES[color]
  const cls =
    size === 'lg'
      ? 'access-groups__icon-box access-groups__icon-box--lg'
      : size === 'list'
        ? 'access-groups__icon-box access-groups__icon-box--list'
        : size === 'sm'
          ? 'access-groups__icon-box access-groups__icon-box--sm'
          : 'access-groups__icon-box'
  return (
    <div
      className={cls}
      style={{ background: palette.soft, color: palette.bg }}
      aria-hidden
    >
      <Icon
        size={
          size === 'lg' ? 40 : size === 'list' ? 26 : size === 'sm' ? 18 : 22
        }
        strokeWidth={1.85}
      />
    </div>
  )
}

function countUsersForGroup(groupId: string): number {
  return loadUsers().filter((u) => userGroupId(u) === groupId).length
}

function userGroupId(u: StoredUser): string {
  return u.groupId ?? (u.isAdmin ? 'grp-administrador' : 'grp-leitura')
}

function usersAssignedToGroup(groupId: string): StoredUser[] {
  return loadUsers().filter((u) => userGroupId(u) === groupId)
}

type EditorMode = 'list' | 'new' | 'edit'

export function AccessGroups() {
  const [groups, setGroups] = useState<AccessGroup[]>(() => loadAccessGroups())
  const [mode, setMode] = useState<EditorMode>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AccessGroup | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [editorTab, setEditorTab] = useState<'info' | 'users'>('info')
  const [listSearch, setListSearch] = useState('')
  const [listView, setListView] = useState<'list' | 'grid'>('list')
  const [listFilter, setListFilter] = useState<'all' | 'active'>('all')
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)

  const reload = useCallback(() => {
    setGroups(loadAccessGroups())
  }, [])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as HTMLElement
      if (t.closest('.access-groups__menu-wrap')) return
      if (t.closest('.access-groups__filter-anchor')) return
      setMenuOpenId(null)
      setFilterMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.name.localeCompare(b.name, 'pt')),
    [groups],
  )

  const filteredListGroups = useMemo(() => {
    let rows = sortedGroups
    if (listFilter === 'active') {
      rows = rows.filter((g) => g.active !== false)
    }
    const q = listSearch.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q),
    )
  }, [sortedGroups, listSearch, listFilter])

  const listStats = useMemo(() => {
    const usersTotal = loadUsers().length
    const groupsTotal = groups.length
    const permSlots = groups.reduce(
      (acc, g) => acc + g.permissionIds.length,
      0,
    )
    return { groupsTotal, usersTotal, permSlots }
  }, [groups])

  const openNew = useCallback(() => {
    setDraft({
      id: newGroupId(),
      name: '',
      description: '',
      color: 'purple',
      iconKey: 'shield',
      permissionIds: [],
      active: true,
    })
    setEditorTab('info')
    setActiveId(null)
    setMode('new')
  }, [])

  const openEdit = useCallback((g: AccessGroup, tab: 'info' | 'users' = 'info') => {
    setDraft({ ...g, permissionIds: [...g.permissionIds] })
    setActiveId(g.id)
    setEditorTab(tab)
    setMode('edit')
    setMenuOpenId(null)
  }, [])

  const backToList = useCallback(() => {
    setMode('list')
    setDraft(null)
    setActiveId(null)
  }, [])

  const persistGroups = useCallback(
    (next: AccessGroup[]) => {
      saveAccessGroups(next)
      reload()
    },
    [reload],
  )

  const handleSave = useCallback(() => {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) {
      window.alert('Informe o nome do grupo.')
      return
    }
    const description = draft.description.trim().slice(0, DESCRIPTION_MAX)
    const normalized: AccessGroup = {
      ...draft,
      name,
      description,
      permissionIds: [...new Set(draft.permissionIds)].filter((id) =>
        ALL_IDS.includes(id),
      ),
      active: draft.active !== false,
    }

    if (mode === 'new') {
      persistGroups([...groups, normalized])
    } else {
      persistGroups(groups.map((g) => (g.id === normalized.id ? normalized : g)))
    }
    backToList()
  }, [draft, mode, groups, persistGroups, backToList])

  const handleDelete = useCallback(
    (g: AccessGroup) => {
      const n = countUsersForGroup(g.id)
      if (n > 0) {
        window.alert(
          `Não é possível excluir o grupo "${g.name}" porque ${n} usuário(s) estão vinculados a ele.`,
        )
        setMenuOpenId(null)
        return
      }
      if (
        !window.confirm(
          `Excluir o grupo "${g.name}"? Esta ação não pode ser desfeita.`,
        )
      ) {
        setMenuOpenId(null)
        return
      }
      persistGroups(groups.filter((x) => x.id !== g.id))
      setMenuOpenId(null)
      if (mode !== 'list' && activeId === g.id) backToList()
    },
    [groups, persistGroups, mode, activeId, backToList],
  )

  const togglePermission = useCallback((id: string) => {
    setDraft((prev) => {
      if (!prev) return prev
      const has = prev.permissionIds.includes(id)
      const permissionIds = has
        ? prev.permissionIds.filter((x) => x !== id)
        : [...prev.permissionIds, id]
      return { ...prev, permissionIds }
    })
  }, [])

  const selectAllPermissions = useCallback((checked: boolean) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        permissionIds: checked ? [...ALL_IDS] : [],
      }
    })
  }, [])

  const allSelected =
    draft !== null && ALL_IDS.every((id) => draft.permissionIds.includes(id))
  const someSelected =
    draft !== null &&
    draft.permissionIds.length > 0 &&
    !allSelected

  const assignedUsers = draft ? usersAssignedToGroup(draft.id) : []
  const assignedCount =
    mode === 'new' ? 0 : draft ? countUsersForGroup(draft.id) : 0

  if (mode !== 'list' && draft) {
    const isActive = draft.active !== false

    return (
      <div className="access-groups access-groups--editor">
        <header className="access-groups__page-head access-groups__page-head--split">
          <div className="access-groups__page-head-main">
            <button
              type="button"
              className="access-groups__back"
              onClick={backToList}
              aria-label="Voltar"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
            <div>
              <h1 className="access-groups__title">
                {mode === 'new' ? 'Novo grupo' : 'Editar grupo'}
              </h1>
              <p className="access-groups__subtitle access-groups__subtitle--editor">
                Defina as informações e permissões que os usuários deste grupo
                terão na plataforma.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="access-groups__save-btn"
            onClick={handleSave}
          >
            {mode === 'new' ? 'Criar grupo' : 'Salvar alterações'}
          </Button>
        </header>

        <div className="access-groups__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={editorTab === 'info'}
            className={`access-groups__tab${editorTab === 'info' ? ' access-groups__tab--active' : ''}`}
            onClick={() => setEditorTab('info')}
          >
            Informações do grupo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={editorTab === 'users'}
            className={`access-groups__tab${editorTab === 'users' ? ' access-groups__tab--active' : ''}`}
            onClick={() => setEditorTab('users')}
          >
            Usuários ({assignedCount})
          </button>
        </div>

        {editorTab === 'users' ? (
          <section className="access-groups__users-tab-panel">
            {mode === 'new' ? (
              <p className="access-groups__users-tab-empty">
                Salve o grupo para visualizar e gerenciar os usuários vinculados.
              </p>
            ) : assignedUsers.length === 0 ? (
              <p className="access-groups__users-tab-empty">
                Nenhum usuário neste grupo no momento.
              </p>
            ) : (
              <div className="access-groups__users-tab-table-wrap">
                <table className="access-groups__users-tab-table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>E-mail</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span className="access-groups__users-tab-name">
                            {u.name}
                          </span>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className="access-groups__users-tab-badge">
                            Ativo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {editorTab === 'info' ? (
          <>
            <section className="access-groups__panel access-groups__panel--info">
              <div className="access-groups__info-layout">
                <div className="access-groups__info-icon-col">
                  <span className="access-groups__info-col-title">
                    Ícone do grupo
                  </span>
                  <GroupIconBox
                    color={draft.color}
                    iconKey={draft.iconKey}
                    size="lg"
                    variant="editor"
                  />
                </div>

                <div className="access-groups__info-middle-col">
                  <label className="access-groups__field">
                    <span className="access-groups__field-label">
                      Nome do grupo{' '}
                      <abbr
                        title="obrigatório"
                        className="access-groups__required"
                      >
                        *
                      </abbr>
                    </span>
                    <input
                      className="access-groups__input"
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, name: e.target.value } : d,
                        )
                      }
                      placeholder="Ex.: Comercial"
                      autoComplete="off"
                    />
                  </label>
                  <label className="access-groups__field">
                    <span className="access-groups__field-label">
                      Descrição
                    </span>
                    <div className="access-groups__textarea-wrap">
                      <textarea
                        className="access-groups__textarea"
                        value={draft.description}
                        maxLength={DESCRIPTION_MAX}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, description: e.target.value } : d,
                          )
                        }
                        rows={5}
                        placeholder="Descreva o papel deste grupo na plataforma."
                      />
                      <span className="access-groups__char-count">
                        {draft.description.length}/{DESCRIPTION_MAX}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="access-groups__info-side-col">
                  <div className="access-groups__field">
                    <span className="access-groups__field-label">
                      Cor do grupo
                    </span>
                    <div className="access-groups__swatches">
                      {GROUP_COLORS_ORDER.map((c) => {
                        const sel = draft.color === c
                        const hex = COLOR_STYLES[c].bg
                        return (
                          <button
                            key={c}
                            type="button"
                            className={`access-groups__swatch${sel ? ' access-groups__swatch--selected' : ''}`}
                            style={{ background: hex }}
                            onClick={() =>
                              setDraft((d) => (d ? { ...d, color: c } : d))
                            }
                            aria-label={`Cor ${c}`}
                            aria-pressed={sel}
                          >
                            {sel ? (
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="access-groups__swatch-check"
                              />
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="access-groups__field access-groups__field--status">
                    <span className="access-groups__field-label">
                      Status do grupo
                    </span>
                    <div
                      className={`access-groups__group-status-badge${isActive ? ' access-groups__group-status-badge--on' : ' access-groups__group-status-badge--off'}`}
                    >
                      <span className="access-groups__group-status-dot" />
                      {isActive ? 'Ativo' : 'Inativo'}
                    </div>
                    <button
                      type="button"
                      className="access-groups__status-toggle-btn"
                      onClick={() =>
                        setDraft((d) =>
                          d ? { ...d, active: !(d.active !== false) } : d,
                        )
                      }
                    >
                      {isActive ? 'Desativar grupo' : 'Ativar grupo'}
                    </button>
                    <p className="access-groups__status-hint">
                      Grupos inativos não podem ser atribuídos a novos usuários.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="access-groups__perm-section">
              <div className="access-groups__perm-head">
                <div>
                  <h2 className="access-groups__perm-title">Permissões</h2>
                  <p className="access-groups__perm-sub">
                    Selecione as funcionalidades que os usuários deste grupo
                    poderão acessar.
                  </p>
                </div>
                <div className="access-groups__perm-actions">
                  <label className="access-groups__select-all">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={(e) =>
                        selectAllPermissions(e.target.checked)
                      }
                    />
                    <span>Selecionar tudo</span>
                  </label>
                </div>
              </div>

              <div className="access-groups__perm-grid access-groups__perm-grid--3">
                {PERMISSION_MODULES.map((mod) => {
                  const CardIcon = CARD_ICON_MAP[mod.icon]
                  return (
                    <article
                      key={mod.title}
                      className="access-groups__perm-card"
                    >
                      <div className="access-groups__perm-card-head">
                        <span
                          className={`access-groups__perm-card-icon access-groups__perm-card-icon--${mod.accent}`}
                        >
                          <CardIcon size={20} strokeWidth={2} />
                        </span>
                        <span className="access-groups__perm-card-head-text">
                          <span className="access-groups__perm-card-title">
                            {mod.title}
                          </span>
                          <span className="access-groups__perm-card-desc">
                            {mod.description}
                          </span>
                        </span>
                      </div>
                      <ul className="access-groups__perm-list">
                        {mod.items.map((item) => (
                          <li key={item.id}>
                            <label className="access-groups__perm-row">
                              <input
                                type="checkbox"
                                checked={draft.permissionIds.includes(
                                  item.id,
                                )}
                                onChange={() => togglePermission(item.id)}
                              />
                              <span>{item.label}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </article>
                  )
                })}
              </div>
            </section>

            <div className="access-groups__info-banner" role="note">
              <Info
                size={20}
                strokeWidth={2}
                className="access-groups__info-banner-icon"
                aria-hidden
              />
              <p>
                As permissões definidas neste grupo serão aplicadas a todos os
                usuários que pertencem a ele. Alterações são aplicadas
                automaticamente.
              </p>
            </div>
          </>
        ) : null}

        {editorTab === 'users' && mode !== 'new' ? (
          <div className="access-groups__info-banner access-groups__info-banner--muted" role="note">
            <Info
              size={20}
              strokeWidth={2}
              className="access-groups__info-banner-icon"
              aria-hidden
            />
            <p>
              Para alterar o grupo de um usuário, utilize a tela{' '}
              <strong>Usuários</strong> na barra lateral.
            </p>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="access-groups access-groups--listing">
      <header className="access-groups__page-head access-groups__page-head--split">
        <div>
          <h1 className="access-groups__title">Grupos de acesso</h1>
          <p className="access-groups__subtitle">
            Organize os acessos da plataforma através de grupos e permissões.
          </p>
        </div>
        <Button
          variant="primary"
          className="access-groups__cta"
          onClick={openNew}
        >
          <CirclePlus size={18} strokeWidth={2} />
          Novo grupo
        </Button>
      </header>

      <section className="access-groups__stats" aria-label="Resumo">
        <article className="access-groups__stat-card">
          <div
            className="access-groups__stat-icon access-groups__stat-icon--groups"
            aria-hidden
          >
            <Users size={22} strokeWidth={2} />
          </div>
          <div className="access-groups__stat-body">
            <div className="access-groups__stat-value">
              {listStats.groupsTotal}
            </div>
            <div className="access-groups__stat-label">Grupos criados</div>
            <div className="access-groups__stat-hint">Total na plataforma</div>
          </div>
        </article>
        <article className="access-groups__stat-card">
          <div
            className="access-groups__stat-icon access-groups__stat-icon--users"
            aria-hidden
          >
            <UserRound size={22} strokeWidth={2} />
          </div>
          <div className="access-groups__stat-body">
            <div className="access-groups__stat-value">
              {listStats.usersTotal}
            </div>
            <div className="access-groups__stat-label">Usuários</div>
            <div className="access-groups__stat-hint">
              Distribuídos pelos grupos
            </div>
          </div>
        </article>
        <article className="access-groups__stat-card">
          <div
            className="access-groups__stat-icon access-groups__stat-icon--perms"
            aria-hidden
          >
            <Eye size={22} strokeWidth={2} />
          </div>
          <div className="access-groups__stat-body">
            <div className="access-groups__stat-value">
              {listStats.permSlots}
            </div>
            <div className="access-groups__stat-label">Permissões</div>
            <div className="access-groups__stat-hint">
              Concedidas aos grupos
            </div>
          </div>
        </article>
      </section>

      <div className="access-groups__toolbar">
        <div className="access-groups__search">
          <Search
            size={18}
            strokeWidth={2}
            className="access-groups__search-icon"
            aria-hidden
          />
          <input
            type="search"
            className="access-groups__search-input"
            placeholder="Buscar grupo..."
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="access-groups__toolbar-right">
          <div className="access-groups__filter-anchor">
            <button
              type="button"
              className="access-groups__filter-btn"
              onClick={() => setFilterMenuOpen((o) => !o)}
              aria-expanded={filterMenuOpen}
            >
              <Filter size={17} strokeWidth={2} aria-hidden />
              Filtrar
            </button>
            {filterMenuOpen ? (
              <div className="access-groups__filter-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className={`access-groups__filter-option${listFilter === 'all' ? ' access-groups__filter-option--active' : ''}`}
                  onClick={() => {
                    setListFilter('all')
                    setFilterMenuOpen(false)
                  }}
                >
                  Todos os grupos
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={`access-groups__filter-option${listFilter === 'active' ? ' access-groups__filter-option--active' : ''}`}
                  onClick={() => {
                    setListFilter('active')
                    setFilterMenuOpen(false)
                  }}
                >
                  Somente ativos
                </button>
              </div>
            ) : null}
          </div>
          <div
            className="access-groups__view-toggle"
            role="group"
            aria-label="Tipo de visualização"
          >
            <button
              type="button"
              className={`access-groups__view-btn${listView === 'grid' ? ' access-groups__view-btn--active' : ''}`}
              aria-pressed={listView === 'grid'}
              onClick={() => setListView('grid')}
              aria-label="Grade"
            >
              <LayoutGrid size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              className={`access-groups__view-btn${listView === 'list' ? ' access-groups__view-btn--active' : ''}`}
              aria-pressed={listView === 'list'}
              onClick={() => setListView('list')}
              aria-label="Lista"
            >
              <LayoutList size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      <div className="access-groups__list-shell">
        {sortedGroups.length === 0 ? (
          <p className="access-groups__empty">Nenhum grupo cadastrado.</p>
        ) : filteredListGroups.length === 0 ? (
          <p className="access-groups__empty">
            Nenhum grupo encontrado para sua busca ou filtro.
          </p>
        ) : listView === 'list' ? (
          <div className="access-groups__list-stack">
            {filteredListGroups.map((g) => {
              const usersCount = countUsersForGroup(g.id)
              const permCount = g.permissionIds.length
              const isDefault = g.id === 'grp-administrador'
              return (
                <article key={g.id} className="access-groups__list-card">
                  <div className="access-groups__list-card-inner">
                    <GroupIconBox
                      color={g.color}
                      iconKey={g.iconKey}
                      size="list"
                    />
                    <div className="access-groups__list-card-body">
                      <div className="access-groups__list-card-title-row">
                        <button
                          type="button"
                          className="access-groups__list-card-title"
                          onClick={() => openEdit(g)}
                        >
                          {g.name}
                        </button>
                        {isDefault ? (
                          <span className="access-groups__badge-default">
                            Padrão
                          </span>
                        ) : null}
                      </div>
                      <p className="access-groups__list-card-desc">
                        {g.description}
                      </p>
                      <div className="access-groups__list-card-meta">
                        <span className="access-groups__meta-pill">
                          <UsersRound size={15} strokeWidth={2} aria-hidden />
                          {usersCount}{' '}
                          {usersCount === 1 ? 'usuário' : 'usuários'}
                        </span>
                        <span className="access-groups__meta-pill">
                          <Shield size={15} strokeWidth={2} aria-hidden />
                          {permCount}{' '}
                          {permCount === 1 ? 'permissão' : 'permissões'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="access-groups__list-card-actions">
                    <div className="access-groups__menu-wrap">
                      <button
                        type="button"
                        className="access-groups__icon-action"
                        aria-label={`Mais opções — ${g.name}`}
                        onClick={() =>
                          setMenuOpenId((id) => (id === g.id ? null : g.id))
                        }
                      >
                        <MoreVertical size={20} strokeWidth={2} />
                      </button>
                      {menuOpenId === g.id ? (
                        <div className="access-groups__menu" role="menu">
                          <button
                            type="button"
                            role="menuitem"
                            className="access-groups__menu-item"
                            onClick={() => openEdit(g)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="access-groups__menu-item access-groups__menu-item--danger"
                            onClick={() => handleDelete(g)}
                          >
                            Excluir
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="access-groups__grid-stack">
            {filteredListGroups.map((g) => {
              const usersCount = countUsersForGroup(g.id)
              const permCount = g.permissionIds.length
              const isDefault = g.id === 'grp-administrador'
              return (
                <article key={g.id} className="access-groups__grid-card">
                  <div className="access-groups__grid-card-top">
                    <GroupIconBox
                      color={g.color}
                      iconKey={g.iconKey}
                      size="list"
                    />
                    <div className="access-groups__grid-card-actions">
                      <button
                        type="button"
                        className="access-groups__icon-action access-groups__icon-action--compact"
                        aria-label={`Gerenciar usuários — ${g.name}`}
                        onClick={() => openEdit(g, 'users')}
                      >
                        <UsersRound size={18} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className="access-groups__icon-action access-groups__icon-action--compact"
                        aria-label={`Permissões — ${g.name}`}
                        onClick={() => openEdit(g, 'info')}
                      >
                        <Shield size={18} strokeWidth={2} />
                      </button>
                      <div className="access-groups__menu-wrap">
                        <button
                          type="button"
                          className="access-groups__icon-action access-groups__icon-action--compact"
                          aria-label={`Mais opções — ${g.name}`}
                          onClick={() =>
                            setMenuOpenId((id) => (id === g.id ? null : g.id))
                          }
                        >
                          <MoreVertical size={18} strokeWidth={2} />
                        </button>
                        {menuOpenId === g.id ? (
                          <div className="access-groups__menu" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              className="access-groups__menu-item"
                              onClick={() => openEdit(g)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="access-groups__menu-item access-groups__menu-item--danger"
                              onClick={() => handleDelete(g)}
                            >
                              Excluir
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="access-groups__grid-card-title"
                    onClick={() => openEdit(g)}
                  >
                    {g.name}
                    {isDefault ? (
                      <span className="access-groups__badge-default access-groups__badge-default--inline">
                        Padrão
                      </span>
                    ) : null}
                  </button>
                  <p className="access-groups__grid-card-desc">
                    {g.description}
                  </p>
                  <div className="access-groups__grid-card-meta">
                    <span className="access-groups__meta-pill access-groups__meta-pill--compact">
                      <UsersRound size={14} strokeWidth={2} aria-hidden />
                      {usersCount}
                    </span>
                    <span className="access-groups__meta-pill access-groups__meta-pill--compact">
                      <Shield size={14} strokeWidth={2} aria-hidden />
                      {permCount}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <footer className="access-groups__footer">
        {sortedGroups.length === 0 ? (
          <>Nenhum grupo cadastrado.</>
        ) : filteredListGroups.length === 0 ? (
          <>Nenhum resultado.</>
        ) : (
          <>
            Mostrando 1 a {filteredListGroups.length} de{' '}
            {filteredListGroups.length}{' '}
            {filteredListGroups.length === 1 ? 'grupo' : 'grupos'}
          </>
        )}
      </footer>
    </div>
  )
}
