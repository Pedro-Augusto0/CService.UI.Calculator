import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function SavedProposalsHero({
  onNovaProposta,
  onExportList,
  exportDisabled,
}: {
  onNovaProposta: () => void
  onExportList: () => void
  exportDisabled: boolean
}) {
  return (
    <header className="saved-page__hero">
      <div>
        <span className="saved-page__eyebrow">Pipeline comercial</span>
        <h1 className="saved-page__title">Propostas salvas</h1>
        <p className="saved-page__lead">
          Gerencie, edite e envie suas propostas de monitoramento com um historico local filtravel.
        </p>
      </div>

      <div className="saved-page__hero-actions">
        <Button
          variant="secondary"
          onClick={onExportList}
          disabled={exportDisabled}
        >
          <Download size={16} strokeWidth={2} aria-hidden />
          Exportar lista
        </Button>
        <Button variant="primary" onClick={onNovaProposta}>
          <Plus size={16} strokeWidth={2} aria-hidden />
          Nova proposta
        </Button>
      </div>
    </header>
  )
}
