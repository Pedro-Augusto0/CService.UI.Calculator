import { useMemo, useState } from 'react'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileText,
  FolderOpen,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useProposal } from '../proposal/ProposalProvider'
import {
  SAVED_PROPOSAL_STATUSES,
  calculateProposalState,
  formatProposalNumber,
  resolveProposalMeta,
  toCalculationInputFromState,
  type SavedProposalRecord,
  type SavedProposalStatus,
} from '../proposal/savedProposalStore'
import { buildProposalHtml } from '../utils/buildProposalHtml'
import { formatCurrency } from '../utils/currency'
import { downloadHtmlDocument, proposalFilename } from '../utils/downloadHtml'
import './PropostasSalvas.css'

interface PropostasSalvasProps {
  onNovaProposta: () => void
  onOpenProposal: (id: string) => void
  onPreviewProposal: (html: string) => void
}

type SortOrder = 'recentes' | 'antigas' | 'maior-valor' | 'menor-valor' | 'cliente'

const STATUS_LABELS: Record<SavedProposalStatus, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  expirada: 'Expirada',
}

const STATUS_TONE: Record<SavedProposalStatus, string> = {
  rascunho: 'warning',
  enviada: 'info',
  aprovada: 'success',
  expirada: 'muted',
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

function closeParentDetails(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return

  const details = target.closest('details')
  if (details instanceof HTMLDetailsElement) {
    details.open = false
  }
}

function collectExtraServices(record: SavedProposalRecord) {
  const labels = [
    record.state.additionals.midiasSociais ? 'Mídias Sociais' : null,
    record.state.additionals.alertasWeb ? 'Alertas WebSites' : null,
    record.state.additionals.api ? 'API' : null,
    record.state.additionals.stories ? 'Stories' : null,
    record.state.additionals.destaques ? 'Destaques' : null,
    record.state.broadcast.tvEnabled ? 'TV' : null,
    record.state.broadcast.radioEnabled ? 'Rádio' : null,
    record.state.broadcast.relatorioEnabled ? 'Relatório' : null,
  ]

  return labels.filter(Boolean) as string[]
}

function formatEditedAt(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(timestamp)
}

function formatCalendarEdit(timestamp: number) {
  const editedAt = new Date(timestamp)
  const now = new Date()
  const startOfEditedDay = new Date(
    editedAt.getFullYear(),
    editedAt.getMonth(),
    editedAt.getDate(),
  )
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round(
    (startOfEditedDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  )
  const timeLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)

  if (diffDays === 0) return `Editada hoje às ${timeLabel}`
  if (diffDays === -1) return `Editada ontem às ${timeLabel}`

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(timestamp)
  return `Editada em ${dateLabel} às ${timeLabel}`
}

function buildPagination(totalPages: number, currentPage: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) return [1, 2, 3, 'ellipsis', totalPages] as const
  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages] as const
  }

  return [1, 'ellipsis', currentPage, 'ellipsis', totalPages] as const
}

export function PropostasSalvas({
  onNovaProposta,
  onOpenProposal,
  onPreviewProposal,
}: PropostasSalvasProps) {
  const {
    savedProposals,
    duplicateSavedProposal,
    updateSavedProposalStatus,
  } = useProposal()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | SavedProposalStatus>('todos')
  const [clientFilter, setClientFilter] = useState('todos')
  const [sortOrder, setSortOrder] = useState<SortOrder>('recentes')
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    return savedProposals.map((record) => {
      const meta = resolveProposalMeta(record.state)
      const calculation = calculateProposalState(record.state)
      const services = [...calculation.selectedMonitoringLabels, ...collectExtraServices(record)]
      const visibleServices = services.slice(0, 5)

      return {
        record,
        clientName: meta.clientName,
        proposalName: meta.proposalName,
        finalPrice: calculation.finalPrice,
        totalVolume: calculation.totalVolume,
        totalKeywords: calculation.totalKeywords,
        visibleServices,
        hiddenServices: Math.max(0, services.length - visibleServices.length),
      }
    })
  }, [savedProposals])

  const clients = useMemo(() => {
    return [...new Set(rows.map((row) => row.clientName))].sort((left, right) =>
      left.localeCompare(right, 'pt-BR'),
    )
  }, [rows])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

    const base = rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        row.clientName.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        row.proposalName.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        formatProposalNumber(row.record.proposalNumber).includes(normalizedQuery)
      const matchesStatus =
        statusFilter === 'todos' || row.record.status === statusFilter
      const matchesClient =
        clientFilter === 'todos' || row.clientName === clientFilter

      return matchesQuery && matchesStatus && matchesClient
    })

    return [...base].sort((left, right) => {
      switch (sortOrder) {
        case 'antigas':
          return left.record.updatedAt - right.record.updatedAt
        case 'maior-valor':
          return right.finalPrice - left.finalPrice
        case 'menor-valor':
          return left.finalPrice - right.finalPrice
        case 'cliente':
          return left.clientName.localeCompare(right.clientName, 'pt-BR')
        case 'recentes':
        default:
          return right.record.updatedAt - left.record.updatedAt
      }
    })
  }, [clientFilter, query, rows, sortOrder, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const paginationItems = buildPagination(totalPages, currentPage)

  function resetFilters() {
    setQuery('')
    setStatusFilter('todos')
    setClientFilter('todos')
    setSortOrder('recentes')
    setPage(1)
  }

  function handleExportList() {
    const header = [
      'Numero',
      'Cliente',
      'Proposta',
      'Status',
      'Valor mensal',
      'Volume monitorado',
      'Ultima edicao',
    ]
    const lines = filteredRows.map((row) => [
      formatProposalNumber(row.record.proposalNumber),
      row.clientName,
      row.proposalName,
      STATUS_LABELS[row.record.status],
      formatCurrency(row.finalPrice),
      `${row.totalVolume} noticias/mes`,
      formatEditedAt(row.record.updatedAt),
    ])

    const csv = [header, ...lines]
      .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'propostas-salvas.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function handlePreview(record: SavedProposalRecord) {
    const calculationInput = toCalculationInputFromState(record.state)
    const calculation = calculateProposalState(record.state)
    const html = buildProposalHtml(calculationInput, calculation, {
      meta: record.state.meta,
      generatedAt: record.updatedAt,
    })
    onPreviewProposal(html)
  }

  function handleDownloadProposal(record: SavedProposalRecord) {
    const calculationInput = toCalculationInputFromState(record.state)
    const calculation = calculateProposalState(record.state)
    const html = buildProposalHtml(calculationInput, calculation, {
      meta: record.state.meta,
      generatedAt: record.updatedAt,
    })
    const meta = resolveProposalMeta(record.state)

    downloadHtmlDocument(
      html,
      proposalFilename(meta.clientName, record.proposalNumber),
    )
  }

  function handleDuplicateFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
  ) {
    duplicateSavedProposal(recordId)
    closeParentDetails(event.currentTarget)
  }

  function handleDownloadFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    record: SavedProposalRecord,
  ) {
    handleDownloadProposal(record)
    closeParentDetails(event.currentTarget)
  }

  function handleOpenFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
  ) {
    onOpenProposal(recordId)
    closeParentDetails(event.currentTarget)
  }

  function handlePreviewFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    record: SavedProposalRecord,
  ) {
    handlePreview(record)
    closeParentDetails(event.currentTarget)
  }

  function handleStatusChangeFromMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
    status: SavedProposalStatus,
  ) {
    updateSavedProposalStatus(recordId, status)
    closeParentDetails(event.currentTarget)
  }

  return (
    <div className="saved-page">
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
            onClick={handleExportList}
            disabled={filteredRows.length === 0}
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

      <section className="saved-page__filters" aria-label="Filtros de propostas">
        <label className="saved-page__search">
          <Search size={16} strokeWidth={2} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar por cliente, proposta ou numero"
          />
        </label>

        <div className="saved-page__filter-grid">
          <label className="saved-page__filter">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as 'todos' | SavedProposalStatus)
                setPage(1)
              }}
            >
              <option value="todos">Todos</option>
              {SAVED_PROPOSAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="saved-page__filter">
            <span>Cliente</span>
            <select
              value={clientFilter}
              onChange={(event) => {
                setClientFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="todos">Todos</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </label>

          <label className="saved-page__filter">
            <span>Data de edição</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
              <option value="maior-valor">Maior valor</option>
              <option value="menor-valor">Menor valor</option>
              <option value="cliente">Cliente A-Z</option>
            </select>
          </label>

          <Button variant="secondary" onClick={resetFilters}>
            <SlidersHorizontal size={16} strokeWidth={2} aria-hidden />
            Limpar filtros
          </Button>
        </div>
      </section>

      {rows.length === 0 ? (
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
      ) : (
        <section className="saved-page__table" aria-label="Lista de propostas salvas">
          <div className="saved-page__table-head">
            <span>Cliente</span>
            <span>Volume monitorado</span>
            <span>Serviços incluídos</span>
            <span>Valor final</span>
            <span>Status</span>
            <span>Ações</span>
          </div>

          <div className="saved-page__rows">
            {paginatedRows.length ? (
              paginatedRows.map((row) => (
                <article key={row.record.id} className="saved-page__row">
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
                    <div className="saved-page__services">
                      {row.visibleServices.map((service) => (
                        <span key={service} className="saved-page__service-chip">
                          {service}
                        </span>
                      ))}
                      {row.hiddenServices ? (
                        <span className="saved-page__service-chip saved-page__service-chip--ghost">
                          +{row.hiddenServices}
                        </span>
                      ) : null}
                    </div>
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
                    <details className="saved-page__status-menu">
                      <summary
                        className={`saved-page__status-badge saved-page__status-badge--${STATUS_TONE[row.record.status]}`}
                      >
                        {STATUS_LABELS[row.record.status]}
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
                    <details className="saved-page__actions-menu">
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
              Mostrando{' '}
              {filteredRows.length
                ? `${(currentPage - 1) * pageSize + 1} a ${Math.min(currentPage * pageSize, filteredRows.length)}`
                : '0 a 0'}{' '}
              de {filteredRows.length} propostas
            </p>

          </footer>
        </section>
      )}
    </div>
  )
}
