import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import {
  Activity,
  BarChart3,
  Coins,
  FileBarChart,
  Info,
  Layers3,
  Mail,
  RadioTower,
  RotateCcw,
  Save,
  Sparkles,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import {
  PriceSettingsFields,
  type PriceSettingsSection,
} from '../components/layout/PriceSettingsFields'
import { DEFAULT_PRICES, type Prices } from '../domain/prices'
import { MONITORING_SERVICE_KEYS } from '../domain/types'
import { useProposal } from '../proposal/ProposalProvider'
import './Configuracao.css'

interface ConfiguracaoProps {
  draftPrices: Prices
  setDraftPrices: Dispatch<SetStateAction<Prices | null>>
}

type ConfigTabId =
  | 'base'
  | 'metrics'
  | 'services'
  | 'distribution'
  | 'broadcast'
  | 'reports'
  | 'extras'

interface ConfigTabItem {
  id: ConfigTabId
  label: string
  title: string
  description: string
  icon: LucideIcon
  visibleSections: PriceSettingsSection[]
}

const CONFIG_TABS: ConfigTabItem[] = [
  {
    id: 'base',
    label: 'Base de cálculo',
    title: 'Base de cálculo',
    description:
      'Concentra os valores de partida usados com mais frequência para montar e revisar a tabela.',
    icon: Wallet,
    visibleSections: [],
  },
  {
    id: 'metrics',
    label: 'Multiplicadores',
    title: 'Multiplicadores',
    description:
      'Ajusta o valor aplicado sobre o volume monitorado antes das demais composições da proposta.',
    icon: BarChart3,
    visibleSections: ['metrics'],
  },
  {
    id: 'services',
    label: 'Serviços monitorados',
    title: 'Serviços monitorados',
    description:
      'Edite os valores unitários dos serviços que compõem o núcleo mensal de monitoramento.',
    icon: Layers3,
    visibleSections: ['services'],
  },
  {
    id: 'distribution',
    label: 'Distribuição',
    title: 'Distribuição',
    description:
      'Centraliza os parâmetros usados nos envios recorrentes de newsletter e rotinas de distribuição.',
    icon: Mail,
    visibleSections: ['distribution'],
  },
  {
    id: 'broadcast',
    label: 'Broadcast',
    title: 'Broadcast',
    description:
      'Configure a cobertura fixa de TV e rádio por praça para compor propostas com mídia tradicional.',
    icon: RadioTower,
    visibleSections: ['broadcast'],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    title: 'Relatórios',
    description:
      'Defina os custos dos entregáveis analíticos recorrentes vinculados à operação.',
    icon: FileBarChart,
    visibleSections: ['reports'],
  },
  {
    id: 'extras',
    label: 'Extras',
    title: 'Extras e regras',
    description:
      'Ajuste serviços avulsos, franquias e regras complementares que alteram o preço final.',
    icon: Sparkles,
    visibleSections: ['additionals'],
  },
]

export function Configuracao({ draftPrices, setDraftPrices }: ConfiguracaoProps) {
  const { state, dispatch } = useProposal()
  const [activeTab, setActiveTab] = useState<ConfigTabId>('base')
  const serviceValues = Object.values(draftPrices.servicePrices)
  const minServicePrice = serviceValues.length ? Math.min(...serviceValues) : 0
  const maxServicePrice = serviceValues.length ? Math.max(...serviceValues) : 0
  const totalConfigFields =
    1 +
    2 +
    MONITORING_SERVICE_KEYS.length +
    Object.keys(draftPrices.broadcast.tv).length +
    Object.keys(draftPrices.broadcast.radio).length +
    Object.keys(draftPrices.broadcast.relatorio).length +
    Object.keys(draftPrices.additionals).length
  const hasPendingPriceChanges = JSON.stringify(draftPrices) !== JSON.stringify(state.prices)
  const isDefaultDraft = JSON.stringify(draftPrices) === JSON.stringify(DEFAULT_PRICES)
  const tabCounts = useMemo<Record<ConfigTabId, number>>(
    () => ({
      base: 3,
      metrics: 1,
      services: MONITORING_SERVICE_KEYS.length,
      distribution: 1,
      broadcast:
        Object.keys(draftPrices.broadcast.tv).length +
        Object.keys(draftPrices.broadcast.radio).length,
      reports: Object.keys(draftPrices.broadcast.relatorio).length,
      extras: Object.keys(draftPrices.additionals).length,
    }),
    [draftPrices],
  )
  const activeTabItem = CONFIG_TABS.find((tab) => tab.id === activeTab) ?? CONFIG_TABS[0]

  function patch<K extends keyof Prices>(key: K, value: Prices[K]) {
    setDraftPrices((prev) => {
      const base = structuredClone(prev ?? draftPrices)
      return { ...base, [key]: value }
    })
  }

  return (
    <div className="config-page wizard-layout">
      <div className="wizard-content config-page__scroll">
        <header className="config-page__intro">
          <div className="config-page__intro-copy">
            <h1 className="config-page__headline">Configuração de preços</h1>
            <p className="config-page__lead">
              Defina os valores base e parâmetros utilizados nos cálculos das propostas.
            </p>
          </div>
        </header>

        <nav className="config-page__tabs" aria-label="Seções da configuração" role="tablist">
          {CONFIG_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={`config-page__tab${activeTab === id ? ' config-page__tab--active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <span className="config-page__tab-icon" aria-hidden>
                <Icon size={15} strokeWidth={2} />
              </span>
              <span className="config-page__tab-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="config-page__panel price-modal">
          <div className="price-modal__header config-page__price-header">
            <div className="config-page__price-head-main">
              <h2 className="config-page__price-panel-title">
                <span className="config-page__panel-ico" aria-hidden>
                  <activeTabItem.icon size={18} strokeWidth={2} />
                </span>
                {activeTabItem.title}
              </h2>
              <p className="config-page__price-copy">
                {activeTabItem.description}
              </p>
            </div>

            <div className="config-page__price-actions">
              <div className="config-page__badges" aria-label="Resumo rápido da tabela">
                <span className="config-page__badge">
                  <Activity size={14} strokeWidth={2} aria-hidden />
                  {tabCounts[activeTab]} parâmetro{tabCounts[activeTab] > 1 ? 's' : ''}
                </span>
                <span className="config-page__badge config-page__badge--muted">
                  {hasPendingPriceChanges ? 'Rascunho em edição' : 'Sem pendências'}
                </span>
              </div>

              <Button
                variant="ghost"
                type="button"
                className="config-page__restore"
                disabled={isDefaultDraft}
                onClick={() => setDraftPrices(structuredClone(DEFAULT_PRICES))}
              >
                <RotateCcw size={16} strokeWidth={2} aria-hidden />
                Restaurar padrão
              </Button>
            </div>
          </div>

          {activeTab === 'base' ? (
            <div className="config-page__base-layout">
              <section className="config-page__section-card" aria-labelledby="config-base-heading">
                <div className="config-page__section-head">
                  <div>
                    <h3 id="config-base-heading" className="config-page__section-title">
                      Base de cálculo
                    </h3>
                    <p className="config-page__section-copy">
                      Valores fundamentais usados como ponto de partida nos cálculos.
                    </p>
                  </div>
                  <span className="config-page__section-badge">3 parâmetros</span>
                </div>

                <section className="config-page__overview" aria-label="Visão geral da configuração">
                  <article className="config-page__overview-card config-page__overview-card--editable">
                    <span className="config-page__overview-icon" aria-hidden>
                      <Wallet size={18} strokeWidth={2} />
                    </span>
                    <div className="config-page__overview-body">
                      <span className="config-page__overview-label">Preço base mensal</span>
                      <p className="config-page__overview-text">
                        Valor fixo aplicado a todas as novas propostas.
                      </p>
                      <TextField
                        dense
                        id="config-preco-base-mensal"
                        className="ui-field--inline-max config-page__inline-field"
                        labelIcon={<Coins size={14} strokeWidth={2} aria-hidden />}
                        label="Valor base (R$)"
                        hint="Valor total incluso na proposta."
                        type="number"
                        min={0}
                        step={1}
                        value={state.precoBaseMensal || ''}
                        onChange={(e) =>
                          dispatch({
                            type: 'SET_PRECO_BASE_MENSAL',
                            value: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </article>

                  <article className="config-page__overview-card">
                    <span className="config-page__overview-icon config-page__overview-icon--soft" aria-hidden>
                      <Coins size={18} strokeWidth={2} />
                    </span>
                    <div className="config-page__overview-body">
                      <span className="config-page__overview-label">Faixa dos serviços variáveis</span>
                      <p className="config-page__overview-text">
                        Referência rápida dos menores e maiores valores utilizados na tabela.
                      </p>
                      <div className="config-page__metric-box">
                        <span className="config-page__metric-prefix">R$</span>
                        <strong>{minServicePrice.toFixed(2).replace('.', ',')}</strong>
                        <span className="config-page__metric-sep">-</span>
                        <strong>{maxServicePrice.toFixed(2).replace('.', ',')}</strong>
                      </div>
                    </div>
                  </article>

                  <article className="config-page__overview-card">
                    <span className="config-page__overview-icon config-page__overview-icon--slate" aria-hidden>
                      <Layers3 size={18} strokeWidth={2} />
                    </span>
                    <div className="config-page__overview-body">
                      <span className="config-page__overview-label">Parâmetros configuráveis</span>
                      <p className="config-page__overview-text">
                        Total de campos disponíveis entre multiplicadores, serviços, broadcast, relatórios e adicionais.
                      </p>
                      <div className="config-page__metric-box config-page__metric-box--count">
                        <strong>{totalConfigFields}</strong>
                        <span>campos</span>
                      </div>
                    </div>
                  </article>
                </section>

                <p className="config-page__section-tip">
                  <Info
                    size={18}
                    strokeWidth={2}
                    className="config-page__section-tip-icon"
                    aria-hidden
                  />
                  <span>
                    Estas configurações formam a base de todos os cálculos das propostas.
                  </span>
                </p>
              </section>

              <section className="config-page__section-card" aria-labelledby="config-newsletter-heading">
                <div className="config-page__section-head">
                  <div>
                    <h3 id="config-newsletter-heading" className="config-page__section-title">
                      Newsletter (envio diário)
                    </h3>
                    <p className="config-page__section-copy">
                      Parâmetros utilizados para cálculo dos envios diários de newsletter.
                    </p>
                  </div>
                  <span className="config-page__section-badge">2 parâmetros</span>
                </div>

                <div className="price-config-metrics config-page__compact-metrics">
                  <div className="price-config-metrics__card">
                    <div className="price-config-metrics__ico" aria-hidden>
                      <BarChart3 size={20} strokeWidth={2} />
                    </div>
                    <div className="price-config-metrics__fields">
                      <TextField
                        dense
                        label="Preço por volume (R$)"
                        hint="Multiplicador aplicado sobre a soma mensal das notícias monitoradas."
                        type="number"
                        min={0}
                        step={0.01}
                        value={draftPrices.volumePrice}
                        onChange={(e) => patch('volumePrice', Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="price-config-metrics__card">
                    <div
                      className="price-config-metrics__ico price-config-metrics__ico--mail"
                      aria-hidden
                    >
                      <Mail size={20} strokeWidth={2} />
                    </div>
                    <div className="price-config-metrics__fields">
                      <TextField
                        dense
                        label="Preço destinatário-envio/dia (R$)"
                        hint="Valor por destinatário por envio diário da newsletter."
                        type="number"
                        min={0}
                        step={0.01}
                        value={draftPrices.destinatarioPrice}
                        onChange={(e) =>
                          patch('destinatarioPrice', Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <PriceSettingsFields
              draft={draftPrices}
              patch={patch}
              visibleSections={activeTabItem.visibleSections}
            />
          )}

          <div className="price-modal__footer config-page__price-footer">
            <p className="config-page__save-hint">
              <Info
                size={18}
                strokeWidth={2}
                className="config-page__save-hint-icon"
                aria-hidden
              />
              <span>
                {hasPendingPriceChanges
                  ? 'As alterações da tabela ainda não foram aplicadas. Salve para usar esses valores nas novas propostas.'
                  : 'Tabela em sincronia. Novas alterações feitas abaixo só passam a valer quando você salvar.'}
              </span>
            </p>
            <Button
              variant="primary"
              type="button"
              disabled={!hasPendingPriceChanges}
              onClick={() =>
                dispatch({
                  type: 'SET_PRICES',
                  prices: structuredClone(draftPrices),
                })
              }
            >
              <Save size={18} strokeWidth={2} aria-hidden />
              {hasPendingPriceChanges ? 'Salvar tabela de preços' : 'Tabela sincronizada'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
