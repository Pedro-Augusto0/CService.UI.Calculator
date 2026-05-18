import {
  Clock,
  MoreVertical,
  Pencil,
  Play,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { CardAccentIcon } from '@/pages/proposal-templates/components/CardAccentIcon'
import type { TemplateListRow } from '@/pages/proposal-templates/lib/proposalTemplatesPageLib'

export function ProposalTemplatesGridView({
  rows,
  mostUsedTemplateId,
  onUsarModelo,
}: {
  rows: TemplateListRow[]
  mostUsedTemplateId: string | null
  onUsarModelo: (templateId: string) => void
}) {
  return (
    <div className="proposal-templates-page__grid">
      {rows.length === 0 ? (
        <div className="proposal-templates-page__empty">
          Nenhum modelo encontrado para esta combinação de filtros.
        </div>
      ) : (
        rows.map((row) => (
          <Card key={row.id} padded={false} className="proposal-templates-page__card">
            <div className="proposal-templates-page__card-top">
              <div className="proposal-templates-page__card-head">
                <div className="proposal-templates-page__card-heading">
                  <div
                    className={`proposal-templates-page__card-icon proposal-templates-page__card-icon--${row.accent}`}
                    aria-hidden
                  >
                    <CardAccentIcon accent={row.accent} />
                  </div>
                  <h2 className="proposal-templates-page__card-title">
                    {row.name}
                  </h2>
                </div>
                {mostUsedTemplateId === row.id ? (
                  <span className="proposal-templates-page__mais-usado">
                    Mais usado
                  </span>
                ) : null}
              </div>
              <p className="proposal-templates-page__card-desc">
                {row.description}
              </p>

              <div className="proposal-templates-page__card-section">
                <div className="proposal-templates-page__card-section-head">
                  <span className="proposal-templates-page__card-section-label">
                    Serviços incluídos
                  </span>
                  <span className="proposal-templates-page__card-section-count">
                    {row.cardContent.includedCount}{' '}
                    {row.cardContent.includedCount === 1 ? 'serviço' : 'serviços'}
                  </span>
                </div>
                <div className="proposal-templates-page__service-chips">
                  {row.cardContent.includedChips.map((chip) => {
                    const ChipIcon = chip.Icon
                    return (
                      <span
                        key={chip.id}
                        className="proposal-templates-page__service-chip"
                      >
                        <ChipIcon
                          size={10}
                          strokeWidth={2}
                          className="proposal-templates-page__service-chip-icon"
                          aria-hidden
                        />
                        {chip.label}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div
                className={
                  row.cardContent.extras.length === 0
                    ? 'proposal-templates-page__card-section proposal-templates-page__card-section--last'
                    : 'proposal-templates-page__card-section'
                }
              >
                <div className="proposal-templates-page__card-section-label proposal-templates-page__card-section-label--block">
                  Distribuição
                </div>
                <div className="proposal-templates-page__dist-grid">
                  <div className="proposal-templates-page__dist-item">
                    <Clock
                      size={16}
                      strokeWidth={2}
                      className="proposal-templates-page__dist-icon"
                      aria-hidden
                    />
                    <span>{row.cardContent.distribution.envios}</span>
                  </div>
                  <div className="proposal-templates-page__dist-item">
                    <Users
                      size={16}
                      strokeWidth={2}
                      className="proposal-templates-page__dist-icon"
                      aria-hidden
                    />
                    <span>{row.cardContent.distribution.destinatarios}</span>
                  </div>
                </div>
              </div>

              {row.cardContent.extras.length > 0 ? (
                <div className="proposal-templates-page__card-section proposal-templates-page__card-section--last">
                  <div className="proposal-templates-page__card-section-label proposal-templates-page__card-section-label--block">
                    Extras
                  </div>
                  <div className="proposal-templates-page__extras-chips">
                    {row.cardContent.extras.map((label) => (
                      <span
                        key={label}
                        className="proposal-templates-page__extra-chip"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="proposal-templates-page__card-stats">
              <p className="proposal-templates-page__card-stat-line">
                Usado em {row.usedInProposals} propostas
              </p>
              <p className="proposal-templates-page__card-stat-line proposal-templates-page__card-stat-line--end">
                Último uso {row.lastUsedDisplay}
              </p>
            </div>
            <div className="proposal-templates-page__card-footer">
              <button
                type="button"
                className="proposal-templates-page__use"
                onClick={() => onUsarModelo(row.id)}
              >
                <Play size={15} strokeWidth={2} aria-hidden />
                Usar modelo
              </button>
              <div className="proposal-templates-page__icon-actions">
                {row.source === 'user' ? (
                  <button
                    type="button"
                    className="proposal-templates-page__icon-btn"
                    aria-label={`Editar ${row.name}`}
                  >
                    <Pencil size={17} strokeWidth={2} />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="proposal-templates-page__icon-btn"
                  aria-label={`Mais ações para ${row.name}`}
                >
                  <MoreVertical size={17} strokeWidth={2} />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
