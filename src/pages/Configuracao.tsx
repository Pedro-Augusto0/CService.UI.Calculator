import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import {
  BarChart3,
  Calculator,
  FileBarChart,
  FileCog,
  HeartHandshake,
  Info,
  Mail,
  RotateCcw,
  Save,
  Settings,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PtDecimalField } from '../components/ui/PtDecimalField'
import {
  PriceSettingsFields,
  type PriceSettingsSection,
} from '../components/layout/PriceSettingsFields'
import {
  DEFAULT_PRECO_BASE_MENSAL,
  DEFAULT_PRICES,
  type Prices,
} from '../domain/prices'
import { useProposal } from '../proposal/ProposalProvider'
import './Configuracao.css'

export type ConfigTabId =
  | 'base'
  | 'services'
  | 'distribution'
  | 'reports'
  | 'extras'

const TAB_PANEL_INFO: Record<Exclude<ConfigTabId, 'base'>, string> = {
  services:
    'Estes valores definem o quanto cada tipo de monitoramento contribui para o total da proposta. Mantenha a coerência com o pacote comercial ofertado.',
  distribution:
    'Os valores de TV e rádio são cobranças fixas por praça. Atualize-os quando negociar novas tabelas com veículos.',
  reports:
    'Relatórios recorrentes aparecem como linhas fixas na proposta; o preço deve refletir o esforço analítico.',
  extras:
    'Franquias, excessos e APIs alteram o resultado final. Revise estes parâmetros quando mudar políticas de uso.',
}

interface ConfiguracaoProps {
  draftPrices: Prices
  setDraftPrices: Dispatch<SetStateAction<Prices | null>>
  draftPrecoBaseMensal: number
  setDraftPrecoBaseMensal: Dispatch<SetStateAction<number | null>>
  onActiveTabChange?: (tab: ConfigTabId) => void
}

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
      'Parâmetros principais que formam a base para todos os cálculos.',
    icon: FileCog,
    visibleSections: [],
  },
  {
    id: 'services',
    label: 'Serviços monitorados',
    title: 'Serviços monitorados',
    description:
      'Valores unitários cobrados por tipo de serviço no núcleo de monitoramento.',
    icon: Share2,
    visibleSections: ['services'],
  },
  {
    id: 'distribution',
    label: 'Distribuição',
    title: 'Distribuição',
    description:
      'TV e rádio por praça — coberturas fixas que entram na proposta.',
    icon: Settings,
    visibleSections: ['broadcast'],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    title: 'Relatórios',
    description: 'Preços dos entregáveis analíticos recorrentes.',
    icon: FileBarChart,
    visibleSections: ['reports'],
  },
  {
    id: 'extras',
    label: 'Extras',
    title: 'Extras',
    description:
      'Adicionais, franquias e parâmetros que ajustam o total da proposta.',
    icon: HeartHandshake,
    visibleSections: ['additionals'],
  },
]

export function Configuracao({
  draftPrices,
  setDraftPrices,
  draftPrecoBaseMensal,
  setDraftPrecoBaseMensal,
  onActiveTabChange,
}: ConfiguracaoProps) {
  const { state, dispatch } = useProposal()
  const [activeTab, setActiveTab] = useState<ConfigTabId>('base')
  const hasPendingPriceChanges =
    JSON.stringify(draftPrices) !== JSON.stringify(state.prices) ||
    draftPrecoBaseMensal !== state.precoBaseMensal
  const isDefaultDraft =
    JSON.stringify(draftPrices) === JSON.stringify(DEFAULT_PRICES) &&
    draftPrecoBaseMensal === DEFAULT_PRECO_BASE_MENSAL
  const activeTabItem = CONFIG_TABS.find((tab) => tab.id === activeTab) ?? CONFIG_TABS[0]

  useEffect(() => {
    onActiveTabChange?.(activeTab)
  }, [activeTab, onActiveTabChange])

  function patch<K extends keyof Prices>(key: K, value: Prices[K]) {
    setDraftPrices((prev) => {
      const base = structuredClone(prev ?? draftPrices)
      return { ...base, [key]: value }
    })
  }

  return (
    <div className="config-page wizard-layout">
      <div className="wizard-content config-page__scroll">
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
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <span className="config-page__tab-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="config-page__panel price-modal">
          <div className="price-modal__header config-page__price-header">
            <div className="config-page__price-head-inner">
              <h2 className="config-page__price-panel-title">{activeTabItem.title}</h2>
              <p className="config-page__price-subtitle">{activeTabItem.description}</p>
            </div>
          </div>

          {activeTab === 'base' ? (
            <div className="config-page__base-layout">
              <article className="config-base-card">
                <div
                  className="config-base-card__icon config-base-card__icon--blue"
                  aria-hidden
                >
                  <Calculator size={22} strokeWidth={1.85} />
                </div>
                <div className="config-base-card__copy">
                  <h3 className="config-base-card__title">Preço base mensal</h3>
                  <p className="config-base-card__desc">
                    Valor fixo aplicado mensalmente a todas as propostas.
                  </p>
                </div>
                <div className="config-base-card__field">
                  <PtDecimalField
                    id="config-preco-base-mensal"
                    label="Valor (R$)"
                    value={draftPrecoBaseMensal}
                    onCommit={(n) => setDraftPrecoBaseMensal(n)}
                  />
                </div>
              </article>

              <article className="config-base-card">
                <div
                  className="config-base-card__icon config-base-card__icon--green"
                  aria-hidden
                >
                  <BarChart3 size={22} strokeWidth={1.85} />
                </div>
                <div className="config-base-card__copy">
                  <h3 className="config-base-card__title">Preço por volume (R$)</h3>
                  <p className="config-base-card__desc">
                    Multiplicador aplicado sobre a soma mensal das notícias monitoradas.
                  </p>
                </div>
                <div className="config-base-card__field">
                  <PtDecimalField
                    id="config-volume-price"
                    label="Multiplicador"
                    value={draftPrices.volumePrice}
                    onCommit={(n) => patch('volumePrice', n)}
                  />
                </div>
              </article>

              <article className="config-base-card">
                <div
                  className="config-base-card__icon config-base-card__icon--orange"
                  aria-hidden
                >
                  <Mail size={22} strokeWidth={1.85} />
                </div>
                <div className="config-base-card__copy">
                  <h3 className="config-base-card__title">
                    Preço destinatário-envio-dia (R$)
                  </h3>
                  <p className="config-base-card__desc">
                    Valor aplicado quando há envios para destinatários recorrentes
                    (newsletter).
                  </p>
                </div>
                <div className="config-base-card__field">
                  <PtDecimalField
                    id="config-destinatario-price"
                    label="Valor"
                    value={draftPrices.destinatarioPrice}
                    onCommit={(n) => patch('destinatarioPrice', n)}
                  />
                </div>
              </article>

              <div className="config-page__info-callout" role="status">
                <span className="config-page__info-callout-icon" aria-hidden>
                  <Info size={20} strokeWidth={2} />
                </span>
                <p className="config-page__info-callout-text">
                  Esses valores são a base para o cálculo de todos os serviços e adicionais.
                  Alterações aqui impactam diretamente o resultado final das propostas.
                </p>
              </div>
            </div>
          ) : (
            <div className="config-page__base-layout">
              <PriceSettingsFields
                draft={draftPrices}
                patch={patch}
                visibleSections={activeTabItem.visibleSections}
              />
              <div className="config-page__info-callout" role="status">
                <span className="config-page__info-callout-icon" aria-hidden>
                  <Info size={20} strokeWidth={2} />
                </span>
                <p className="config-page__info-callout-text">
                  {TAB_PANEL_INFO[activeTab]}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="config-page__actions-bar">
          <Button
            variant="secondary"
            type="button"
            className="config-page__restore"
            disabled={isDefaultDraft}
            onClick={() => {
              setDraftPrices(structuredClone(DEFAULT_PRICES))
              setDraftPrecoBaseMensal(DEFAULT_PRECO_BASE_MENSAL)
            }}
          >
            <RotateCcw size={16} strokeWidth={2} aria-hidden />
            Restaurar padrão
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!hasPendingPriceChanges}
            onClick={() =>
              dispatch({
                type: 'COMMIT_PRICING_CONFIG',
                prices: structuredClone(draftPrices),
                precoBaseMensal: draftPrecoBaseMensal,
              })
            }
          >
            <Save size={18} strokeWidth={2} aria-hidden />
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
