import {
  Building2,
  CheckCircle2,
  CircleOff,
} from 'lucide-react'

export function ClientsSummaryCards({
  stats,
}: {
  stats: {
    total: number
    active: number
    inactive: number
  }
}) {
  return (
    <section className="clients-page__cards" aria-label="Resumo">
      <article className="clients-page__card">
        <div
          className="clients-page__card-icon clients-page__card-icon--total"
          aria-hidden
        >
          <Building2 size={22} strokeWidth={2} />
        </div>
        <div className="clients-page__card-body">
          <div className="clients-page__card-label">Total de clientes</div>
          <div className="clients-page__card-value">{stats.total}</div>
          <div className="clients-page__card-hint">
            Todos os clientes cadastrados
          </div>
        </div>
      </article>
      <article className="clients-page__card">
        <div
          className="clients-page__card-icon clients-page__card-icon--active"
          aria-hidden
        >
          <CheckCircle2 size={22} strokeWidth={2} />
        </div>
        <div className="clients-page__card-body">
          <div className="clients-page__card-label">Clientes ativos</div>
          <div className="clients-page__card-value">{stats.active}</div>
          <div className="clients-page__card-hint">
            Disponíveis para novas propostas
          </div>
        </div>
      </article>
      <article className="clients-page__card">
        <div
          className="clients-page__card-icon clients-page__card-icon--inactive"
          aria-hidden
        >
          <CircleOff size={22} strokeWidth={2} />
        </div>
        <div className="clients-page__card-body">
          <div className="clients-page__card-label">Clientes inativos</div>
          <div className="clients-page__card-value">{stats.inactive}</div>
          <div className="clients-page__card-hint">
            Desativados no cadastro
          </div>
        </div>
      </article>
    </section>
  )
}
