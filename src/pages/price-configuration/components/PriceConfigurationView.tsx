import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Info, RotateCcw, Save } from 'lucide-react'
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
  const activeTabIndex = CONFIG_TABS.findIndex((t) => t.id === activeTab)
  const safeIndex = activeTabIndex >= 0 ? activeTabIndex : 0
  const canPrev = safeIndex > 0
  const canNext = safeIndex < CONFIG_TABS.length - 1
  const prevTabLabel =
    canPrev ? CONFIG_TABS[safeIndex - 1]?.label ?? '' : ''
  const nextTabLabel =
    canNext ? CONFIG_TABS[safeIndex + 1]?.label ?? '' : ''

  const scrollTopAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollTopAnchorRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [activeTab])

  return (
    <div className="config-page wizard-layout">
      <div className="wizard-content config-page__scroll">
        <div ref={scrollTopAnchorRef} className="config-page__toolbar">
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

        <div className="wizard-footer config-page__tab-footer">
          <Button
            variant="secondary"
            type="button"
            disabled={!canPrev}
            onClick={() => {
              if (canPrev) setActiveTab(CONFIG_TABS[safeIndex - 1].id)
            }}
            aria-label={
              canPrev ? `Ir para aba anterior: ${prevTabLabel}` : undefined
            }
          >
            <ChevronLeft size={18} strokeWidth={2} aria-hidden />
            Aba anterior
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!canNext}
            onClick={() => {
              if (canNext) setActiveTab(CONFIG_TABS[safeIndex + 1].id)
            }}
            aria-label={
              canNext ? `Ir para próxima aba: ${nextTabLabel}` : undefined
            }
          >
            Próxima aba
            <ChevronRight size={18} strokeWidth={2} aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  )
}
