import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ProposalTemplatesHero({
  query,
  setQuery,
  onNovoModelo,
}: {
  query: string
  setQuery: (v: string) => void
  onNovoModelo: () => void
}) {
  return (
    <header className="proposal-templates-page__hero">
      <div className="proposal-templates-page__titles">
        <h1 className="proposal-templates-page__title">Modelos de Proposta</h1>
        <p className="proposal-templates-page__lead">
          Crie e gerencie modelos para agilizar a criação de novas propostas.
        </p>
      </div>
      <div className="proposal-templates-page__hero-actions">
        <label className="proposal-templates-page__search">
          <Search size={18} strokeWidth={2} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar modelos..."
            autoComplete="off"
          />
        </label>
        <Button
          variant="primary"
          className="proposal-templates-page__new-btn"
          onClick={onNovoModelo}
        >
          <Plus size={18} strokeWidth={2} aria-hidden />
          Novo modelo
        </Button>
      </div>
    </header>
  )
}
