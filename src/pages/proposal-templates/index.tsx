import { useMemo, useState } from 'react'
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Clock,
  Globe,
  LayoutGrid,
  List,
  MoreVertical,
  Newspaper,
  Pencil,
  Play,
  Plus,
  Search,
  Target,
  Tv,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import {
  templateCardContentFromSnapshot,
  type TemplateCardContent,
} from '@/features/proposal/lib/proposalTemplateCardContent'
import {
  BUILTIN_TEMPLATE_CARDS,
  getBuiltinTemplateSnapshot,
  type BuiltinTemplateCategory,
} from '@/features/proposal/lib/proposalTemplates'
import './ProposalTemplates.css'

export type TemplateTabId =
  | 'todos'
  | 'monitoramento'
  | 'tv-radio'
  | 'digital'
  | 'personalizados'

type TemplateAccent = 'violet' | 'green' | 'orange' | 'blue'

type RowCategory = BuiltinTemplateCategory | 'personalizados'

interface TemplateListRow {
  id: string
  source: 'builtin' | 'user'
  name: string
  description: string
  tierLabel: string
  usedInProposals: number
  lastUsedDisplay: string
  sortKeyRecent: number
  category: RowCategory
  accent: TemplateAccent
  cardContent: TemplateCardContent
  searchBlob: string
}

const TABS: { id: TemplateTabId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'monitoramento', label: 'Monitoramento' },
  { id: 'tv-radio', label: 'TV & Rádio' },
  { id: 'digital', label: 'Digital' },
  { id: 'personalizados', label: 'Personalizados' },
]

type SortId = 'mais-utilizados' | 'recentes' | 'nome'

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function parseBrDate(value: string) {
  const [dd, mm, yyyy] = value.split('/').map((part) => Number.parseInt(part, 10))
  if (
    !Number.isFinite(dd)
    || !Number.isFinite(mm)
    || !Number.isFinite(yyyy)
  ) {
    return 0
  }
  return new Date(yyyy, mm - 1, dd).getTime()
}

function formatPtShort(ts: number | null) {
  if (ts == null) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(ts)
}

function CardAccentIcon({ accent }: { accent: TemplateAccent }) {
  const iconProps = { size: 15, strokeWidth: 2 }
  switch (accent) {
    case 'violet':
      return <Newspaper {...iconProps} />
    case 'green':
      return <Zap {...iconProps} />
    case 'orange':
      return <Tv {...iconProps} />
    case 'blue':
      return <Globe {...iconProps} />
  }
}

interface ProposalTemplatesProps {
  onNovoModelo: () => void
  onUsarModelo: (templateId: string) => void
}

export function ProposalTemplates({
  onNovoModelo,
  onUsarModelo,
}: ProposalTemplatesProps) {
  const { userProposalTemplates } = useProposal()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TemplateTabId>('todos')
  const [sort, setSort] = useState<SortId>('mais-utilizados')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const allRows = useMemo((): TemplateListRow[] => {
    const builtIns: TemplateListRow[] = BUILTIN_TEMPLATE_CARDS.map((b) => {
      const snap = getBuiltinTemplateSnapshot(b.id)
      const cardContent = templateCardContentFromSnapshot(snap)
      const searchBlob = [
        b.name,
        b.description,
        ...cardContent.includedChips.map((c) => c.label),
        ...cardContent.extras,
        cardContent.distribution.envios,
        cardContent.distribution.destinatarios,
      ]
        .join(' ')
        .toLowerCase()
      return {
        id: b.id,
        source: 'builtin',
        name: b.name,
        description: b.description,
        tierLabel: b.tierLabel,
        usedInProposals: b.usedInProposals,
        lastUsedDisplay: b.lastUsedDisplay,
        sortKeyRecent: parseBrDate(b.lastUsedDisplay),
        category: b.category,
        accent: b.accent,
        cardContent,
        searchBlob,
      }
    })

    const userRows: TemplateListRow[] = userProposalTemplates.map((u) => {
      const snap = u.snapshot
      const cardContent = templateCardContentFromSnapshot(snap)
      const desc =
        u.description || 'Sem descrição — edite o modelo para orientar a equipe.'
      const searchBlob = [
        u.name,
        desc,
        ...cardContent.includedChips.map((c) => c.label),
        ...cardContent.extras,
        cardContent.distribution.envios,
        cardContent.distribution.destinatarios,
      ]
        .join(' ')
        .toLowerCase()
      return {
        id: u.id,
        source: 'user',
        name: u.name,
        description: desc,
        tierLabel: 'Personalizado',
        usedInProposals: u.usedCount,
        lastUsedDisplay: formatPtShort(u.lastUsedAt),
        sortKeyRecent: u.lastUsedAt ?? u.updatedAt,
        category: 'personalizados',
        accent: 'violet',
        cardContent,
        searchBlob,
      }
    })

    return [...builtIns, ...userRows]
  }, [userProposalTemplates])

  const filteredSorted = useMemo(() => {
    const q = normalizeQuery(query)
    const base = allRows.filter((row) => {
      if (tab === 'personalizados') {
        if (row.source !== 'user') return false
      } else if (tab !== 'todos') {
        if (row.source !== 'builtin' || row.category !== tab) return false
      }
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q)
        || row.description.toLowerCase().includes(q)
        || row.searchBlob.includes(q)
      )
    })

    const next = [...base]
    if (sort === 'mais-utilizados') {
      next.sort((a, b) => b.usedInProposals - a.usedInProposals)
    } else if (sort === 'nome') {
      next.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    } else {
      next.sort((a, b) => b.sortKeyRecent - a.sortKeyRecent)
    }
    return next
  }, [allRows, query, tab, sort])

  const customTemplatesCount = userProposalTemplates.length

  const mostUsedTemplateId = useMemo(() => {
    if (allRows.length === 0) return null
    const max = Math.max(...allRows.map((r) => r.usedInProposals))
    if (max <= 0) return null
    const top = allRows.filter((r) => r.usedInProposals === max)
    return top.length === 1 ? top[0].id : null
  }, [allRows])

  return (
    <div className="proposal-templates-page">
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

      <section className="proposal-templates-page__kpis" aria-label="Resumo">
        <div className="proposal-templates-page__kpi">
          <div
            className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--blue"
            aria-hidden
          >
            <Briefcase size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="proposal-templates-page__kpi-value">
              {BUILTIN_TEMPLATE_CARDS.length + customTemplatesCount}
            </p>
            <p className="proposal-templates-page__kpi-label">Modelos criados</p>
            <p className="proposal-templates-page__kpi-hint">
              Padrão do sistema + seus modelos salvos
            </p>
          </div>
        </div>
        <div className="proposal-templates-page__kpi">
          <div
            className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--green"
            aria-hidden
          >
            <BarChart3 size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="proposal-templates-page__kpi-value">7</p>
            <p className="proposal-templates-page__kpi-label">Mais utilizados</p>
            <p className="proposal-templates-page__kpi-hint">
              Usados nos últimos 30 dias
            </p>
          </div>
        </div>
        <div className="proposal-templates-page__kpi">
          <div
            className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--green"
            aria-hidden
          >
            <Target size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="proposal-templates-page__kpi-value">85%</p>
            <p className="proposal-templates-page__kpi-label">Agilidade</p>
            <p className="proposal-templates-page__kpi-hint">
              Propostas criadas com modelos
            </p>
          </div>
        </div>
        <div className="proposal-templates-page__kpi">
          <div
            className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--purple"
            aria-hidden
          >
            <ClipboardList size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="proposal-templates-page__kpi-value">24</p>
            <p className="proposal-templates-page__kpi-label">
              Propostas geradas
            </p>
            <p className="proposal-templates-page__kpi-hint">
              A partir de modelos este mês
            </p>
          </div>
        </div>
      </section>

      <div className="proposal-templates-page__toolbar">
        <div
          className="proposal-templates-page__tabs"
          role="tablist"
          aria-label="Categorias de modelos"
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={
                tab === id
                  ? 'proposal-templates-page__tab proposal-templates-page__tab--active'
                  : 'proposal-templates-page__tab'
              }
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="proposal-templates-page__toolbar-right">
          <div className="proposal-templates-page__sort">
            <span>Ordenar por:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              aria-label="Ordenar modelos"
            >
              <option value="mais-utilizados">Mais utilizados</option>
              <option value="recentes">Último uso</option>
              <option value="nome">Nome (A–Z)</option>
            </select>
          </div>
          <div
            className="proposal-templates-page__view-toggle"
            role="group"
            aria-label="Modo de visualização"
          >
            <button
              type="button"
              className={
                view === 'grid'
                  ? 'proposal-templates-page__view-btn proposal-templates-page__view-btn--active'
                  : 'proposal-templates-page__view-btn'
              }
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
              aria-label="Grade"
            >
              <LayoutGrid size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              className={
                view === 'list'
                  ? 'proposal-templates-page__view-btn proposal-templates-page__view-btn--active'
                  : 'proposal-templates-page__view-btn'
              }
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              aria-label="Lista"
            >
              <List size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="proposal-templates-page__grid">
          {filteredSorted.length === 0 ? (
            <div className="proposal-templates-page__empty">
              Nenhum modelo encontrado para esta combinação de filtros.
            </div>
          ) : (
            filteredSorted.map((row) => (
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
      ) : (
        <div className="proposal-templates-page__list">
          {filteredSorted.length === 0 ? (
            <div className="proposal-templates-page__empty">
              Nenhum modelo encontrado para esta combinação de filtros.
            </div>
          ) : (
            filteredSorted.map((row) => (
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
      )}
    </div>
  )
}
