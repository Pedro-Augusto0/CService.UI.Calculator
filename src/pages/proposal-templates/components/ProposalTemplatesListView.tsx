import { Pencil, Play } from 'lucide-react'
import { CardAccentIcon } from '@/pages/proposal-templates/components/CardAccentIcon'
import type { TemplateListRow } from '@/pages/proposal-templates/lib/proposalTemplatesPageLib'

export function ProposalTemplatesListView({
  rows,
  onUsarModelo,
}: {
  rows: TemplateListRow[]
  onUsarModelo: (templateId: string) => void
}) {
  return (
    <div className="proposal-templates-page__list">
      {rows.length === 0 ? (
        <div className="proposal-templates-page__empty">
          Nenhum modelo encontrado para esta combinação de filtros.
        </div>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="proposal-templates-page__list-row">
            <div className="proposal-templates-page__list-main">
              <div
                className={`proposal-templates-page__card-icon proposal-templates-page__card-icon--${row.accent}`}
                aria-hidden
              >
                <CardAccentIcon accent={row.accent} />
              </div>
              <div className="proposal-templates-page__list-copy">
                <p className="proposal-templates-page__list-title">{row.name}</p>
                <p className="proposal-templates-page__list-desc">
                  {row.description}
                </p>
                <p className="proposal-templates-page__list-chips-preview">
                  {row.cardContent.includedChips
                    .slice(0, 4)
                    .map((c) => c.label)
                    .join(' · ')}
                  {row.cardContent.includedChips.length > 4
                    ? ` · +${row.cardContent.includedChips.length - 4}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="proposal-templates-page__badges">
              <span className="proposal-templates-page__badge">
                {row.cardContent.includedCount} serviços
              </span>
              <span className="proposal-templates-page__badge">
                {row.tierLabel}
              </span>
            </div>
            <div className="proposal-templates-page__list-meta">
              Usado em {row.usedInProposals} propostas
            </div>
            <div className="proposal-templates-page__list-meta">
              Último uso {row.lastUsedDisplay}
            </div>
            <div className="proposal-templates-page__list-actions">
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
                className="proposal-templates-page__use"
                onClick={() => onUsarModelo(row.id)}
              >
                <Play size={15} strokeWidth={2} aria-hidden />
                Usar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
