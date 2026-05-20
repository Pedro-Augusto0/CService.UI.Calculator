import { useMemo, useState } from 'react'
import {
  BookMarked,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileBarChart,
  FilePlus2,
  FileText,
  Layers,
  Lock,
  MonitorPlay,
  MoreHorizontal,
  Newspaper,
  Plus,
  Radar,
  Save,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { FIXED_PROPOSAL_VALIDADE_DIAS } from '@/features/proposal/lib/proposalReducer'
import { formatCurrency } from '@/utils/currency'
import {
  MATTER_SERVICE_LABELS,
  REGION_LABELS,
  REPORT_FREQUENCY_LABELS,
} from '@/domain/prices'
import { MATTER_SERVICE_KEYS } from '@/domain/types'
import {
  buildAdditionalsRows,
  buildReportRows,
} from '@/pages/wizard/steps/resumo-proposta/resumoTables'
import './SummaryPanel.css'

export interface SummaryPanelResumoStepActions {
  onSaveProposal: () => void
  onDownload: () => void
  onOpenSaveTemplate: () => void
  saveProposalLabel: string
}

interface SummaryPanelProps {
  /** Na etapa Resumo: ações da barra lateral (salvar / baixar / modelo). */
  resumoStepActions?: SummaryPanelResumoStepActions | null
}

interface ServiceGroup {
  key: string
  title: string
  emptyLabel: string
  items: string[]
  summary: string
  tone: 'blue' | 'green' | 'orange'
  icon: LucideIcon
  chevron?: 'down' | 'right'
}

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function SummaryPanel({ resumoStepActions = null }: SummaryPanelProps) {
  const { calculation: c, state } = useProposal()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const isResumoStep = state.currentStep === 4

  const matterLabels = MATTER_SERVICE_KEYS.filter((k) =>
    state.sections.marcas.services[k] ||
    state.sections.concorrentes.services[k] ||
    state.sections.setor.services[k],
  ).map((k) => MATTER_SERVICE_LABELS[k])

  const reportRowsQuick = useMemo(
    () => buildReportRows(state.reports, state.prices.reports),
    [state.reports, state.prices.reports],
  )
  const additionalRowsQuick = useMemo(
    () => buildAdditionalsRows(state.additionals, state.prices.additionals),
    [state.additionals, state.prices.additionals],
  )

  const serviceGroups = useMemo<ServiceGroup[]>(() => {
    const a = state.additionals
    const r = state.reports

    const monitoramentoLabels: string[] = [
      a.impressoEnabled ? 'Impresso' : null,
      a.webNacionalEnabled ? 'Web (Nacional)' : null,
      a.webInternacionalEnabled ? 'Web (Internacional)' : null,
      a.tvEnabled && a.tvRegion ? `TV ${REGION_LABELS[a.tvRegion]}` : null,
      a.radioEnabled && a.radioRegion ? `Rádio ${REGION_LABELS[a.radioRegion]}` : null,
      a.midiasSociaisEnabled ? 'Mídias Sociais' : null,
      a.storiesInstagramEnabled ? 'Stories Instagram' : null,
    ].filter(Boolean) as string[]

    const adicionaisExtrasLabels: string[] = [
      a.alertasWebRealtime ? 'Alertas Web' : null,
      a.apiCService ? 'API CService' : null,
      a.newsletterWhatsApp ? 'Newsletter WhatsApp' : null,
      a.newsletterExtraEnvios > 0
        ? `${a.newsletterExtraEnvios} newsletter extra${a.newsletterExtraEnvios === 1 ? '' : 's'}`
        : null,
      a.destinatariosExtrasEnabled ? 'Destinatários extras' : null,
      a.curadoriaAprovacaoManual ? 'Curadoria manual' : null,
    ].filter(Boolean) as string[]

    const modificadoresLabels: string[] = [
      a.plantaoFimSemana ? `Plantão (+${c.plantaoPercent}%)` : null,
      a.aprovacaoAutomatica ? `Aprovação automática (-${c.aprovacaoAutomaticaPercent}%)` : null,
    ].filter(Boolean) as string[]

    const reportLabels: string[] = [
      r.executivoEnabled && r.executivoFreq
        ? `Executivo ${REPORT_FREQUENCY_LABELS[r.executivoFreq].toLowerCase()}`
        : null,
      r.estrategicoEnabled && r.estrategicoFreq
        ? `Estratégico ${REPORT_FREQUENCY_LABELS[r.estrategicoFreq].toLowerCase()}`
        : null,
      r.biEnabled ? 'CService BI' : null,
    ].filter(Boolean) as string[]

    const adicionaisSidebarItems = [
      ...adicionaisExtrasLabels,
      ...modificadoresLabels,
    ]

    return [
      {
        key: 'matter',
        title: 'Serviços por matéria',
        emptyLabel: 'Nenhum serviço selecionado',
        items: matterLabels,
        summary: matterLabels.length
          ? pluralize(matterLabels.length, 'serviço', 'serviços')
          : 'Nenhum',
        tone: 'blue',
        icon: MonitorPlay,
        chevron: 'down',
      },
      {
        key: 'reports',
        title: 'Relatórios e BI',
        emptyLabel: 'Nenhum relatório selecionado',
        items: reportLabels,
        summary: reportLabels.length
          ? pluralize(reportLabels.length, 'relatório', 'relatórios')
          : 'Nenhum',
        tone: 'green',
        icon: FileBarChart,
        chevron: 'down',
      },
      {
        key: 'monitoramentos',
        title: 'Monitoramentos',
        emptyLabel: 'Nenhum canal selecionado',
        items: monitoramentoLabels,
        summary: monitoramentoLabels.length
          ? pluralize(monitoramentoLabels.length, 'canal', 'canais')
          : 'Nenhum',
        tone: 'blue',
        icon: Radar,
        chevron: 'down',
      },
      {
        key: 'adicionais',
        title: 'Adicionais e modificadores',
        emptyLabel: 'Nenhum adicional ativo',
        items: adicionaisSidebarItems,
        summary: adicionaisSidebarItems.length
          ? pluralize(adicionaisSidebarItems.length, 'item', 'itens')
          : 'Nenhum',
        tone: 'orange',
        icon: Sparkles,
        chevron: 'right',
      },
    ]
  }, [matterLabels, state.additionals, state.reports, c.plantaoPercent, c.aprovacaoAutomaticaPercent])

  const lines = [
    {
      label: 'Preço base mensal',
      value: c.breakdownGroups.precoBaseMensal,
      hide: c.breakdownGroups.precoBaseMensal <= 0,
    },
    {
      label: 'Serviços por matéria',
      value: c.breakdownGroups.servicosMateria,
      hide: false,
    },
    {
      label: 'Relatórios e BI',
      value: c.breakdownGroups.relatoriosBi,
      hide: false,
    },
    {
      label: 'Serviços adicionais',
      value: c.breakdownGroups.servicosAdicionais,
      hide: false,
    },
  ].filter((x) => !x.hide)

  const financeLedgerLinesResumo = [
    { label: 'Preço base mensal', value: c.breakdownGroups.precoBaseMensal },
    { label: 'Serviços por matéria', value: c.breakdownGroups.servicosMateria },
    { label: 'Relatórios e BI', value: c.breakdownGroups.relatoriosBi },
    { label: 'Serviços adicionais', value: c.breakdownGroups.servicosAdicionais },
  ].filter(
    (l) => l.label !== 'Preço base mensal' || l.value > 0,
  )

  function toggleGroup(key: string) {
    setExpandedGroups((current) => (current[key] ? {} : { [key]: true }))
  }

  if (isResumoStep && resumoStepActions) {
    return (
      <aside className="summary-panel summary-panel--wizard-resumo">
        <div className="summary-panel__resumo-aside-stack">
          <div className="summary-panel__card summary-panel__card--resumo-finance">
            <h3 className="summary-panel__finance-heading">Resumo financeiro</h3>
            <div className="summary-panel__ledger summary-panel__ledger--resumo">
              {financeLedgerLinesResumo.map((l) => (
                <div key={l.label} className="summary-panel__ledger-row">
                  <span className="summary-panel__ledger-label">{l.label}</span>
                  <span className="summary-panel__ledger-value">
                    {formatCurrency(l.value)}
                  </span>
                </div>
              ))}
              <div className="summary-panel__ledger-row summary-panel__ledger-row--subtotal">
                <span className="summary-panel__ledger-label">Subtotal</span>
                <span className="summary-panel__ledger-value">
                  {formatCurrency(c.subtotalBeforeModifiers)}
                </span>
              </div>
              {state.additionals.plantaoFimSemana ? (
                <div className="summary-panel__ledger-row summary-panel__ledger-row--credit">
                  <span className="summary-panel__ledger-label">
                    Plantão incluso (+{c.plantaoPercent}%)
                  </span>
                  <span className="summary-panel__ledger-value">
                    + {formatCurrency(c.valorAcrescimoPlantao)}
                  </span>
                </div>
              ) : null}
              {state.additionals.aprovacaoAutomatica ? (
                <div className="summary-panel__ledger-row summary-panel__ledger-row--debit">
                  <span className="summary-panel__ledger-label">
                    Aprovação automática (−{c.aprovacaoAutomaticaPercent}%)
                  </span>
                  <span className="summary-panel__ledger-value">
                    − {formatCurrency(Math.abs(c.valorDescontoAprovacaoAutomatica))}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="summary-panel__resumo-total-mensal">
              <div className="summary-panel__resumo-total-kicker">TOTAL MENSAL</div>
              <div className="summary-panel__resumo-total-value">
                {formatCurrency(c.finalPrice)}
              </div>
            </div>
          </div>

          <div className="summary-panel__card summary-panel__card--resumo-quick">
            <h3 className="summary-panel__quick-heading">Resumo rápido</h3>
            <div className="summary-panel__quick-grid">
              <div className="summary-panel__quick-cell">
                <span className="summary-panel__quick-icon" aria-hidden>
                  <Plus size={15} strokeWidth={2.2} />
                </span>
                <div>
                  <span className="summary-panel__quick-num">{c.totalKeywords}</span>
                  <span className="summary-panel__quick-unit"> termos</span>
                </div>
              </div>
              <div className="summary-panel__quick-cell">
                <span className="summary-panel__quick-icon" aria-hidden>
                  <Newspaper size={15} strokeWidth={2.1} />
                </span>
                <div>
                  <span className="summary-panel__quick-num">{c.totalVolume}</span>
                  <span className="summary-panel__quick-unit"> notícias/mês</span>
                </div>
              </div>
              <div className="summary-panel__quick-cell">
                <span className="summary-panel__quick-icon" aria-hidden>
                  <Layers size={15} strokeWidth={2} />
                </span>
                <div>
                  <span className="summary-panel__quick-num">{matterLabels.length}</span>
                  <span className="summary-panel__quick-unit"> serviços</span>
                </div>
              </div>
              <div className="summary-panel__quick-cell">
                <span className="summary-panel__quick-icon" aria-hidden>
                  <FileBarChart size={15} strokeWidth={2} />
                </span>
                <div>
                  <span className="summary-panel__quick-num">{reportRowsQuick.length}</span>
                  <span className="summary-panel__quick-unit"> relatórios</span>
                </div>
              </div>
              <div className="summary-panel__quick-cell summary-panel__quick-cell--wide">
                <span className="summary-panel__quick-icon" aria-hidden>
                  <FilePlus2 size={15} strokeWidth={2} />
                </span>
                <div>
                  <span className="summary-panel__quick-num">{additionalRowsQuick.length}</span>
                  <span className="summary-panel__quick-unit"> itens adicionais</span>
                </div>
              </div>
            </div>

            <hr className="summary-panel__resumo-actions-rule" />

            <div className="summary-panel__resumo-actions">
              <Button
                variant="primary"
                className="summary-panel__resumo-action-btn"
                onClick={resumoStepActions.onSaveProposal}
              >
                <Save size={16} strokeWidth={2.2} aria-hidden />
                {resumoStepActions.saveProposalLabel}
              </Button>
              <Button
                variant="secondary"
                className="summary-panel__resumo-action-btn"
                onClick={resumoStepActions.onDownload}
              >
                <FileText size={16} strokeWidth={2.2} aria-hidden />
                Baixar proposta (HTML)
              </Button>
              <button
                type="button"
                className="summary-panel__resumo-link-template"
                onClick={resumoStepActions.onOpenSaveTemplate}
              >
                <BookMarked size={15} strokeWidth={2} aria-hidden />
                Salvar como modelo
              </button>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="summary-panel">
      <div className="summary-panel__card">
        <div className="summary-panel__content">
          <div className="summary-panel__header">
            <h2 className="summary-panel__title">Resumo da proposta</h2>
            <button
              type="button"
              className="summary-panel__header-action"
              aria-label="Mais opções"
            >
              <MoreHorizontal size={18} strokeWidth={2.1} aria-hidden />
            </button>
          </div>

          <section className="summary-panel__stats-block" aria-label="Volume estimado">
            <div className="summary-panel__stats-card">
              <div className="summary-panel__stats">
                <div className="summary-panel__stat">
                  <span className="summary-panel__stat-icon summary-panel__stat-icon--blue" aria-hidden>
                    <Plus size={16} strokeWidth={2.2} />
                  </span>
                  <div className="summary-panel__stat-copy">
                    <span className="summary-panel__stat-number">{c.totalKeywords}</span>
                    <span className="summary-panel__stat-unit">termos</span>
                  </div>
                </div>
                <div className="summary-panel__stat">
                  <span className="summary-panel__stat-icon summary-panel__stat-icon--sky" aria-hidden>
                    <Newspaper size={16} strokeWidth={2.1} />
                  </span>
                  <div className="summary-panel__stat-copy">
                    <span className="summary-panel__stat-number">{c.totalVolume}</span>
                    <span className="summary-panel__stat-unit">notícias/mês</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="summary-panel__block">
            <div className="summary-panel__block-head">
              <h3 className="summary-panel__section-title">Itens selecionados</h3>
              <span className="summary-panel__block-note">
                {state.globalBillingMode === 'fixed' ? 'Modo: Fixo' : 'Modo: Variável'}
              </span>
            </div>

            <div className="summary-panel__services">
              {serviceGroups.map((group) => {
                const expanded = Boolean(expandedGroups[group.key])
                const GroupIcon = group.icon
                const ChevronIcon = group.chevron === 'right' ? ChevronRight : ChevronDown

                return (
                  <section
                    key={group.key}
                    className={`summary-panel__group summary-panel__group--direction-${group.chevron ?? 'down'}${expanded ? ' summary-panel__group--expanded' : ''}${group.items.length === 0 ? ' summary-panel__group--empty' : ''}`}
                  >
                    <button
                      type="button"
                      className="summary-panel__group-toggle"
                      onClick={() => toggleGroup(group.key)}
                      disabled={group.items.length === 0}
                      aria-expanded={expanded}
                    >
                      <span
                        className={`summary-panel__group-icon summary-panel__group-icon--${group.tone}`}
                        aria-hidden
                      >
                        <GroupIcon size={14} strokeWidth={2} />
                      </span>
                      <span className="summary-panel__group-main">
                        <span className="summary-panel__group-title">{group.title}</span>
                      </span>
                      <span className="summary-panel__group-summary">{group.summary}</span>
                      <ChevronIcon
                        className="summary-panel__group-chevron"
                        size={15}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>

                    {expanded ? (
                      <div className="summary-panel__group-body">
                        {group.items.length ? (
                          <div className="summary-panel__tag-list">
                            {group.items.map((item) => (
                              <span key={item} className="summary-panel__tag">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="summary-panel__empty">{group.emptyLabel}</p>
                        )}
                      </div>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </section>
        </div>

        <div className="summary-panel__pricing">
          <section className="summary-panel__block summary-panel__block--values">
            <div className="summary-panel__block-head">
              <h3 className="summary-panel__section-title">Resumo de valores</h3>
              <span className="summary-panel__block-note">mensal</span>
            </div>
            <div className="summary-panel__ledger">
              {lines.map((l) => (
                <div key={l.label} className="summary-panel__ledger-row">
                  <span className="summary-panel__ledger-label">{l.label}</span>
                  <span className="summary-panel__ledger-value">
                    {formatCurrency(l.value)}
                  </span>
                </div>
              ))}
              <div className="summary-panel__ledger-row summary-panel__ledger-row--subtotal">
                <span className="summary-panel__ledger-label">Subtotal</span>
                <span className="summary-panel__ledger-value">
                  {formatCurrency(c.subtotalBeforeModifiers)}
                </span>
              </div>
              {state.additionals.plantaoFimSemana ? (
                <div className="summary-panel__ledger-row summary-panel__ledger-row--credit">
                  <span className="summary-panel__ledger-label">
                    Plantão (+{c.plantaoPercent}%)
                  </span>
                  <span className="summary-panel__ledger-value">
                    + {formatCurrency(c.valorAcrescimoPlantao)}
                  </span>
                </div>
              ) : null}
              {state.additionals.aprovacaoAutomatica ? (
                <div className="summary-panel__ledger-row summary-panel__ledger-row--debit">
                  <span className="summary-panel__ledger-label">
                    Aprovação automática (−{c.aprovacaoAutomaticaPercent}%)
                  </span>
                  <span className="summary-panel__ledger-value">
                    − {formatCurrency(Math.abs(c.valorDescontoAprovacaoAutomatica))}
                  </span>
                </div>
              ) : null}
              <div className="summary-panel__ledger-row summary-panel__ledger-row--subtotal">
                <span className="summary-panel__ledger-label">Validade</span>
                <span className="summary-panel__ledger-value">
                  {FIXED_PROPOSAL_VALIDADE_DIAS} dias (fixa)
                </span>
              </div>
            </div>
          </section>

          <div className="summary-panel__final">
            <div className="summary-panel__final-icon" aria-hidden>
              <DollarSign size={18} strokeWidth={2.1} />
            </div>
            <div className="summary-panel__final-kicker">Preço final mensal</div>
            <div className="summary-panel__final-value">
              {formatCurrency(c.finalPrice)}
            </div>
            <div className="summary-panel__final-hint">por mês</div>
          </div>

          <p className="summary-panel__footer-note">
            <Lock size={14} strokeWidth={2.1} aria-hidden />
            <span>
              Seus dados estão seguros conosco.
              <br />
              Não compartilhamos informações.
            </span>
          </p>
        </div>
      </div>
    </aside>
  )
}
