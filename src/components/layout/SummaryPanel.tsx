import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
  meta?: string
}

const PREVIEW_LIMIT = 3

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function formatBroadcastRegion(region: 'sp_rj' | 'nacional') {
  return region === 'sp_rj' ? 'SP/RJ' : 'Nacional'
}

function formatBroadcastFrequency(freq: 'mensal' | 'semanal') {
  return freq === 'mensal' ? 'Mensal' : 'Semanal'
}

export function SummaryPanel() {
  const { calculation: c, state } = useProposal()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const serviceGroups = useMemo<ServiceGroup[]>(() => {
    const additionalLabels = [
      state.additionals.midiasSociais ? 'Mídias Sociais' : null,
      state.additionals.alertasWeb ? 'Alertas WebSites' : null,
      state.additionals.api ? 'Acesso API' : null,
      state.additionals.stories ? 'Stories' : null,
      state.additionals.destaques ? 'Destaques da Semana' : null,
    ].filter(Boolean) as string[]

    const deliveryLabels = [
      state.broadcast.tvEnabled && state.broadcast.tvRegion
        ? `TV ${formatBroadcastRegion(state.broadcast.tvRegion)}`
        : null,
      state.broadcast.radioEnabled && state.broadcast.radioRegion
        ? `Rádio ${formatBroadcastRegion(state.broadcast.radioRegion)}`
        : null,
      state.broadcast.relatorioEnabled && state.broadcast.relatorioFreq
        ? `Relatório ${formatBroadcastFrequency(state.broadcast.relatorioFreq)}`
        : null,
      state.operational.enviosDiarios > 0
        ? `${state.operational.enviosDiarios} envios/dia`
        : null,
      state.operational.numDestinatarios > 0
        ? `${state.operational.numDestinatarios} destinatários`
        : null,
    ].filter(Boolean) as string[]

    return [
      {
        key: 'monitoramento',
        title: 'Monitoramento',
        emptyLabel: 'Nenhum serviço ativo',
        items: c.selectedMonitoringLabels,
        summary: c.selectedMonitoringLabels.length
          ? pluralize(c.selectedMonitoringLabels.length, 'serviço', 'serviços')
          : 'Nenhum',
        tone: 'blue',
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
      },
      {
        key: 'distribuicao',
        title: 'Distribuição e relatórios',
        emptyLabel: 'Nenhum item configurado',
        items: deliveryLabels,
        summary: deliveryLabels.length
          ? `${deliveryLabels[0]}${deliveryLabels.length > 1 ? ` +${deliveryLabels.length - 1}` : ''}`
          : 'Não configurado',
        tone: 'orange',
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
    setExpandedGroups((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  return (
    <aside className="summary-panel">
      <div className="summary-panel__card">
        <div className="summary-panel__content">
          <div className="summary-panel__header">
            <h2 className="summary-panel__title">Resumo da proposta</h2>
          </div>

          <section className="summary-panel__stats-block">
            <h3 className="summary-panel__section-title">Volume estimado</h3>
            <div className="summary-panel__stats-card">
              <div className="summary-panel__stats">
                <div className="summary-panel__stat">
                  <span className="summary-panel__stat-label">Palavras-chave</span>
                  <span className="summary-panel__stat-number">{c.totalKeywords}</span>
                  <span className="summary-panel__stat-unit">termos</span>
                </div>
                <div className="summary-panel__stat">
                  <span className="summary-panel__stat-label">Volume estimado</span>
                  <span className="summary-panel__stat-number">{c.totalVolume}</span>
                  <span className="summary-panel__stat-unit">notícias / mês</span>
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
                const visibleItems = expanded
                  ? group.items
                  : group.items.slice(0, PREVIEW_LIMIT)
                const overflowCount = group.items.length - visibleItems.length

                return (
                  <section
                    key={group.key}
                    className={`summary-panel__group${expanded ? ' summary-panel__group--expanded' : ''}${group.items.length === 0 ? ' summary-panel__group--empty' : ''}`}
                  >
                    <button
                      type="button"
                      className="summary-panel__group-toggle"
                      onClick={() => toggleGroup(group.key)}
                      disabled={group.items.length === 0}
                      aria-expanded={expanded}
                    >
                      <span
                        className={`summary-panel__group-dot summary-panel__group-dot--${group.tone}`}
                        aria-hidden
                      />
                      <span className="summary-panel__group-main">
                        <span className="summary-panel__group-title">{group.title}</span>
                      </span>
                      <span className="summary-panel__group-summary">{group.summary}</span>
                      <ChevronDown
                        className="summary-panel__group-chevron"
                        size={16}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>

                    <div className="summary-panel__group-body">
                      {group.items.length ? (
                        <div className="summary-panel__tag-list">
                          {visibleItems.map((item) => (
                            <span key={item} className="summary-panel__tag">
                              {item}
                            </span>
                          ))}
                          {overflowCount > 0 ? (
                            <button
                              type="button"
                              className="summary-panel__more"
                              onClick={() => toggleGroup(group.key)}
                            >
                              +{overflowCount} ver mais
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <p className="summary-panel__empty">{group.emptyLabel}</p>
                      )}

                      {group.meta ? (
                        <p className="summary-panel__group-note">{group.meta}</p>
                      ) : null}
                    </div>
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
                    −{' '}
                    {formatCurrency(Math.abs(c.valorImpactoAprovacaoAutomatica))}
                  </span>
                </div>
              ) : null}
            </div>
          </section>

          <div className="summary-panel__final">
            <div className="summary-panel__final-kicker">Preço final</div>
            <div className="summary-panel__final-value">
              {formatCurrency(c.finalPrice)}
            </div>
            <div className="summary-panel__final-hint">por mês</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
