import {
  CheckCircle2,
  LayoutGrid,
  Shield,
  Users as UsersIcon,
} from 'lucide-react'

export function UsersSummaryCards({
  stats,
}: {
  stats: {
    total: number
    groupsTotal: number
    admins: number
    active: number
  }
}) {
  return (
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
          className="users-page__card-icon users-page__card-icon--groups"
          aria-hidden
        >
          <LayoutGrid size={22} strokeWidth={2} />
        </div>
        <div className="users-page__card-body">
          <div className="users-page__card-label">Grupos de acesso</div>
          <div className="users-page__card-value">{stats.groupsTotal}</div>
          <div className="users-page__card-hint">
            Perfis com permissões agrupadas
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
  )
}
