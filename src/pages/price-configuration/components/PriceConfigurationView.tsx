import { Info, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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

          <div className="config-page__base-layout">
            <PriceSettingsFields draft={draftPrices} patch={patch} section={activeTab} />
            <div className="config-page__info-callout" role="status">
              <span className="config-page__info-callout-icon" aria-hidden>
                <Info size={20} strokeWidth={2} />
              </span>
              <p className="config-page__info-callout-text">{TAB_PANEL_INFO[activeTab]}</p>
            </div>
          </div>
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
