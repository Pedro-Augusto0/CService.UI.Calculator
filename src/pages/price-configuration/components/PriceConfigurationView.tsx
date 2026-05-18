import type { Dispatch, SetStateAction } from 'react'
import {
  BarChart3,
  Calculator,
  Info,
  Mail,
  RotateCcw,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PtDecimalField } from '@/components/ui/PtDecimalField'
import { PriceSettingsFields } from '@/features/pricing-config/components/PriceSettingsFields'
import type { Prices } from '@/domain/prices'
import type { ConfigTabId } from '@/features/pricing-config/types'
import {
  CONFIG_TABS,
  TAB_PANEL_INFO,
  type ConfigTabItem,
} from '@/pages/price-configuration/lib/priceConfigurationPageLib'

export function PriceConfigurationView({
  draftPrices,
  draftPrecoBaseMensal,
  setDraftPrecoBaseMensal,
  activeTab,
  setActiveTab,
  activeTabItem,
  hasPendingPriceChanges,
  isDefaultDraft,
  patch,
  handleRestore,
  handleSave,
}: {
  draftPrices: Prices
  draftPrecoBaseMensal: number
  setDraftPrecoBaseMensal: Dispatch<SetStateAction<number | null>>
  activeTab: ConfigTabId
  setActiveTab: (t: ConfigTabId) => void
  activeTabItem: ConfigTabItem
  hasPendingPriceChanges: boolean
  isDefaultDraft: boolean
  patch: <K extends keyof Prices>(key: K, value: Prices[K]) => void
  handleRestore: () => void
  handleSave: () => void
}) {
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
            onClick={handleRestore}
          >
            <RotateCcw size={16} strokeWidth={2} aria-hidden />
            Restaurar padrão
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!hasPendingPriceChanges}
            onClick={handleSave}
          >
            <Save size={18} strokeWidth={2} aria-hidden />
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
