import type { Dispatch, SetStateAction } from 'react'
import {
  CirclePlus,
  Eye,
  Filter,
  MoreVertical,
  Search,
  Shield,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import type { AccessGroup } from '@/features/access-groups/types'
import type { EditorTabName } from '@/pages/access-groups/hooks/useAccessGroupsPage'
import { GroupIconBox } from '@/pages/access-groups/components/GroupIconBox'
import { countUsersForGroup } from '@/pages/access-groups/lib/accessGroupsLib'

export function AccessGroupsListing({
  listStats,
  listSearch,
  setListSearch,
  listView,
  setListView,
  listFilter,
  setListFilter,
  filterMenuOpen,
  setFilterMenuOpen,
  sortedGroups,
  filteredListGroups,
  openNew,
  openEdit,
  handleDelete,
  menuOpenId,
  setMenuOpenId,
}: {
  listStats: { groupsTotal: number; usersTotal: number; permSlots: number }
  listSearch: string
  setListSearch: Dispatch<SetStateAction<string>>
  listView: 'list' | 'grid'
  setListView: Dispatch<SetStateAction<'list' | 'grid'>>
  listFilter: 'all' | 'active'
  setListFilter: Dispatch<SetStateAction<'all' | 'active'>>
  filterMenuOpen: boolean
  setFilterMenuOpen: Dispatch<SetStateAction<boolean>>
  sortedGroups: AccessGroup[]
  filteredListGroups: AccessGroup[]
  openNew: () => void
  openEdit: (g: AccessGroup, tab?: EditorTabName) => void
  handleDelete: (g: AccessGroup) => void
  menuOpenId: string | null
  setMenuOpenId: Dispatch<SetStateAction<string | null>>
}) {
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
          <ViewModeToggle value={listView} onChange={setListView} />
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
