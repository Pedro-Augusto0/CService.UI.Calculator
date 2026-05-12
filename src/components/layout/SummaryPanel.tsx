import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Lock,
  MonitorPlay,
  MoreHorizontal,
  Newspaper,
  Plus,
  Send,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import { useProposal } from '../../proposal/ProposalProvider'
import './SummaryPanel.css'

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

function formatBroadcastRegion(region: 'sp_rj' | 'nacional') {
  return region === 'sp_rj' ? 'SP/RJ' : 'Nacional'
}

function formatBroadcastFrequency(freq: 'mensal' | 'semanal') {
  return freq === 'mensal' ? 'Mensal' : 'Semanal'
}

function formatDailyDeliveries(count: number) {
  return `${count} ${count === 1 ? 'envio/dia' : 'envios/dia'}`
}

function formatRecipients(count: number) {
  return `${count} ${count === 1 ? 'dest.' : 'dest.'}`
}

export function SummaryPanel() {
  const { calculation: c, state } = useProposal()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const serviceGroups = useMemo<ServiceGroup[]>(() => {
    const additionalLabels = [
      state.additionals.midiasSociais ? 'Mídias Sociais' : null,
      state.additionals.alertasWeb ? 'Alertas de Websites' : null,
      state.additionals.api ? 'Acesso API' : null,
      state.additionals.stories ? 'Stories' : null,
      state.additionals.destaques ? 'Destaques da Semana' : null,
    ].filter(Boolean) as string[]

    const deliveryLabels = [
      state.operational.enviosDiarios > 0
        ? `${state.operational.enviosDiarios} ${state.operational.enviosDiarios === 1 ? 'envio por dia' : 'envios por dia'}`
        : null,
      state.operational.numDestinatarios > 0
        ? `${state.operational.numDestinatarios} destinatário${state.operational.numDestinatarios === 1 ? '' : 's'}`
        : null,
      state.broadcast.tvEnabled && state.broadcast.tvRegion
        ? `TV ${formatBroadcastRegion(state.broadcast.tvRegion)}`
        : null,
      state.broadcast.radioEnabled && state.broadcast.radioRegion
        ? `Rádio ${formatBroadcastRegion(state.broadcast.radioRegion)}`
        : null,
      state.broadcast.relatorioEnabled && state.broadcast.relatorioFreq
        ? `Relatório ${formatBroadcastFrequency(state.broadcast.relatorioFreq)}`
        : null,
    ].filter(Boolean) as string[]

    const deliverySummaryParts = [
      state.operational.enviosDiarios > 0
        ? formatDailyDeliveries(state.operational.enviosDiarios)
        : null,
      state.operational.numDestinatarios > 0
        ? formatRecipients(state.operational.numDestinatarios)
        : null,
    ].filter(Boolean) as string[]

    return [
      {
        key: 'monitoramento',
        title: 'Monitoramento de mídia',
        emptyLabel: 'Nenhum serviço ativo',
        items: c.selectedMonitoringLabels,
        summary: c.selectedMonitoringLabels.length
          ? pluralize(c.selectedMonitoringLabels.length, 'serviço', 'serviços')
          : 'Nenhum',
        tone: 'blue',
        icon: MonitorPlay,
        chevron: 'down',
      },
      {
        key: 'adicionais',
        title: 'Serviços adicionais',
        emptyLabel: 'Nenhum adicional ativo',
        items: additionalLabels,
        summary: additionalLabels.length
          ? pluralize(additionalLabels.length, 'serviço', 'serviços')
          : 'Nenhum',
        tone: 'green',
        icon: Sparkles,
        chevron: 'down',
      },
      {
        key: 'distribuicao',
        title: 'Distribuição e relatórios',
        emptyLabel: 'Nenhum item configurado',
        items: deliveryLabels,
        summary: deliverySummaryParts.length
          ? deliverySummaryParts.join(' + ')
          : 'Não configurado',
        tone: 'orange',
        icon: Send,
        chevron: 'right',
      },
    ]
  }, [
    c.selectedMonitoringLabels,
    state.additionals.alertasWeb,
    state.additionals.api,
    state.additionals.destaques,
    state.additionals.midiasSociais,
    state.additionals.stories,
    state.broadcast.radioEnabled,
    state.broadcast.radioRegion,
    state.broadcast.relatorioEnabled,
    state.broadcast.relatorioFreq,
    state.broadcast.tvEnabled,
    state.broadcast.tvRegion,
    state.operational.enviosDiarios,
    state.operational.numDestinatarios,
  ])

  const lines = [
    {
      label: 'Preço base mensal',
      value: c.breakdownGroups.precoBaseMensal,
      hide: c.breakdownGroups.precoBaseMensal <= 0,
    },
    {
      label: 'Serviços de monitoramento',
      value: c.breakdownGroups.servicosMonitoramento,
      hide: false,
    },
    {
      label: 'Serviços adicionais',
      value: c.breakdownGroups.servicosAdicionais,
      hide: false,
    },
    {
      label: 'Relatório analítico',
      value: c.breakdownGroups.relatorioAnalitico,
      hide: false,
    },
  ].filter((x) => !x.hide)

  const subtotalExModifiers = c.volumeMonetaryBase + c.sumServiceValues

  function toggleGroup(key: string) {
    setExpandedGroups((current) => (current[key] ? {} : { [key]: true }))
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
              <h3 className="summary-panel__section-title">Serviços selecionados</h3>
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
                  {formatCurrency(subtotalExModifiers)}
                </span>
              </div>
              {state.operational.envioFeriadosFds ? (
                <div className="summary-panel__ledger-row summary-panel__ledger-row--credit">
                  <span className="summary-panel__ledger-label">Acréscimos</span>
                  <span className="summary-panel__ledger-value">
                    + {formatCurrency(c.valorAcrescimoFimDeSemana)}
                  </span>
                </div>
              ) : null}
              {state.operational.aprovacaoAutomatica ? (
                <div className="summary-panel__ledger-row summary-panel__ledger-row--debit">
                  <span className="summary-panel__ledger-label">Descontos</span>
                  <span className="summary-panel__ledger-value">
                    − {formatCurrency(Math.abs(c.valorImpactoAprovacaoAutomatica))}
                  </span>
                </div>
              ) : null}
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
