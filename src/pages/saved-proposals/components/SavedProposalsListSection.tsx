import {
  Building2,
  Copy,
  Eye,
  FileText,
  FolderOpen,
  MoreHorizontal,
  PencilLine,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  SAVED_PROPOSAL_STATUSES,
  formatProposalNumber,
  type SavedProposalRecord,
  type SavedProposalStatus,
} from '@/features/proposal/lib/savedProposalStore'
import { formatCurrency } from '@/utils/currency'
import type { SavedProposalRow } from '@/pages/saved-proposals/hooks/useSavedProposalsListing'
import { formatCalendarEdit } from '@/pages/saved-proposals/lib/presentation'
import { STATUS_LABELS, statusLabel, statusTone } from '@/pages/saved-proposals/lib/statusMeta'

const SERVICES_PREVIEW_MAX = 2

function SavedProposalServicesSummary({
  services,
  onMenuToggle,
  previewMax = SERVICES_PREVIEW_MAX,
}: {
  services: string[]
  onMenuToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => void
  /** Inline chips before "+N" overflow (grid cards can show more). */
  previewMax?: number
}) {
  if (services.length === 0) {
    return (
      <div className="saved-page__services">
        <span className="saved-page__services-empty">—</span>
      </div>
    )
  }

  const preview =
    services.length <= previewMax ? services : services.slice(0, previewMax)
  const overflowCount = services.length - preview.length

  return (
    <div className="saved-page__services">
      {preview.map((service, index) => (
        <span key={`${service}-${index}`} className="saved-page__service-chip">
          {service}
        </span>
      ))}
      {overflowCount > 0 ? (
        <details className="saved-page__services-popover" onToggle={onMenuToggle}>
          <summary
            className="saved-page__service-chip saved-page__service-chip--ghost saved-page__services-more-summary"
            aria-label={`Ver todos os ${services.length} serviços incluídos`}
          >
            +{overflowCount} {overflowCount === 1 ? 'serviço' : 'serviços'}
          </summary>
          <div className="saved-page__services-dropdown">
            <ul className="saved-page__services-dropdown-list">
              {services.map((service, index) => (
                <li key={`${service}-${index}`}>
                  <span className="saved-page__service-chip saved-page__service-dropdown-chip">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}
    </div>
  )
}

export function SavedProposalsListSection({
  rows,
  filteredRows,
  viewMode,
  onNovaProposta,
  handleMenuToggle,
  handleStatusChangeFromMenu,
  handleOpenFromMenu,
  handlePreviewFromMenu,
  handleDuplicateFromMenu,
  handleDownloadFromMenu,
}: {
  rows: SavedProposalRow[]
  filteredRows: SavedProposalRow[]
  viewMode: 'list' | 'grid'
  onNovaProposta: () => void
  handleMenuToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => void
  handleStatusChangeFromMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
    status: SavedProposalStatus,
  ) => void
  handleOpenFromMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
  ) => void
  handlePreviewFromMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    record: SavedProposalRecord,
  ) => void
  handleDuplicateFromMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
  ) => void
  handleDownloadFromMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    record: SavedProposalRecord,
  ) => void
}) {
  if (rows.length === 0) {
    return (
      <Card className="saved-page__empty">
        <div className="saved-page__empty-icon" aria-hidden>
          <FolderOpen size={26} strokeWidth={2} />
        </div>
        <h2 className="saved-page__empty-title">Nenhuma proposta salva por enquanto</h2>
        <p className="saved-page__empty-text">
            Salve a proposta na etapa final para montar este painel com filtros, historico e atalhos de edicao.
        </p>
        <Button variant="primary" className="saved-page__cta" onClick={onNovaProposta}>
          <Plus size={18} strokeWidth={2} aria-hidden />
          Nova proposta
        </Button>
      </Card>
    )
  }

  return (
    <section
      className={`saved-page__table saved-page__table--${viewMode}`}
      aria-label="Lista de propostas salvas"
    >
      {viewMode === 'list' ? (
        <div className="saved-page__table-head">
          <span>Cliente</span>
          <span>Volume monitorado</span>
          <span>Serviços incluídos</span>
          <span>Valor final</span>
          <span>Status</span>
          <span>Ações</span>
        </div>
      ) : null}

      <div className={`saved-page__rows saved-page__rows--${viewMode}`}>
        {filteredRows.length ? (
          filteredRows.map((row) => (
            <article
              key={row.record.id}
              className={`saved-page__row saved-page__row--${viewMode}`}
            >
              <div className="saved-page__company">
                <span
                  className={`saved-page__company-icon saved-page__company-icon--${row.record.proposalNumber % 4}`}
                  aria-hidden
                >
                  <Building2 size={18} strokeWidth={2} />
                </span>
                <div className="saved-page__company-content">
                  <strong className="saved-page__company-name">{row.clientName}</strong>
                  <span className="saved-page__company-meta">
                    {row.proposalName} {formatProposalNumber(row.record.proposalNumber)}
                  </span>
                  <span className="saved-page__company-updated">
                    <span className="saved-page__company-updated-dot" aria-hidden />
                    {formatCalendarEdit(row.record.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="saved-page__metric">
                <span className="saved-page__cell-label">Volume monitorado</span>
                <div className="saved-page__metric-main">
                  <strong>{row.totalVolume.toLocaleString('pt-BR')}</strong>
                  <span className="saved-page__metric-unit">notícias/mês</span>
                </div>
                <span className="saved-page__metric-meta">{row.totalKeywords} termos</span>
              </div>

              <div className="saved-page__services-cell">
                <span className="saved-page__cell-label">Serviços incluídos</span>
                <SavedProposalServicesSummary
                  services={row.allServices}
                  onMenuToggle={handleMenuToggle}
                  previewMax={viewMode === 'grid' ? 5 : SERVICES_PREVIEW_MAX}
                />
              </div>

              <div className="saved-page__price">
                <span className="saved-page__cell-label">Valor final</span>
                <div className="saved-page__price-main">
                  <strong>{formatCurrency(row.finalPrice)}</strong>
                  <span className="saved-page__price-unit">/mês</span>
                </div>
              </div>

              <div className="saved-page__status">
                <span className="saved-page__cell-label">Status</span>
                <details className="saved-page__status-menu" onToggle={handleMenuToggle}>
                  <summary
                    className={`saved-page__status-badge saved-page__status-badge--${statusTone(row.record.status)}`}
                  >
                    {statusLabel(row.record.status)}
                  </summary>
                  <div className="saved-page__menu-dropdown saved-page__menu-dropdown--status">
                    {SAVED_PROPOSAL_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`saved-page__menu-item${status === row.record.status ? ' saved-page__menu-item--active' : ''}`}
                        onClick={(event) =>
                          handleStatusChangeFromMenu(
                            event,
                            row.record.id,
                            status,
                          )
                        }
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </details>
              </div>

              <div className="saved-page__actions">
                <details className="saved-page__actions-menu" onToggle={handleMenuToggle}>
                  <summary
                    className="saved-page__action-trigger"
                    aria-label="Abrir ações da proposta"
                  >
                    <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
                  </summary>
                  <div className="saved-page__menu-dropdown saved-page__menu-dropdown--actions">
                    <button
                      type="button"
                      className="saved-page__menu-item"
                      onClick={(event) =>
                        handleOpenFromMenu(event, row.record.id)
                      }
                    >
                      <PencilLine size={15} strokeWidth={2} aria-hidden />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="saved-page__menu-item"
                      onClick={(event) =>
                        handlePreviewFromMenu(event, row.record)
                      }
                    >
                      <Eye size={15} strokeWidth={2} aria-hidden />
                      Visualizar
                    </button>
                    <button
                      type="button"
                      className="saved-page__menu-item"
                      onClick={(event) =>
                        handleDuplicateFromMenu(event, row.record.id)
                      }
                    >
                      <Copy size={15} strokeWidth={2} aria-hidden />
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className="saved-page__menu-item"
                      onClick={(event) =>
                        handleDownloadFromMenu(event, row.record)
                      }
                    >
                      <FileText size={15} strokeWidth={2} aria-hidden />
                      Gerar HTML
                    </button>
                  </div>
                </details>
              </div>
            </article>
          ))
        ) : (
          <Card className="saved-page__empty-results">
            <h2 className="saved-page__empty-results-title">Nenhum resultado encontrado</h2>
            <p className="saved-page__empty-results-text">
                Ajuste os filtros ou limpe a busca para voltar a ver todas as propostas salvas.
            </p>
          </Card>
        )}
      </div>

      <footer className="saved-page__footer">
        <p className="saved-page__footer-meta">
          {filteredRows.length === 0
            ? 'Nenhuma proposta encontrada'
            : `Mostrando ${filteredRows.length} ${
                filteredRows.length === 1 ? 'proposta' : 'propostas'
              }`}
        </p>

      </footer>
    </section>
  )
}
