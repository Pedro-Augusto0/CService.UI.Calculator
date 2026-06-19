import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import {
  DEFAULT_BASE_MONTHLY_PRICE,
  DEFAULT_PRICES,
  type Prices,
} from '@/domain/prices'
import type { ConfigTabId } from '@/features/pricing-config/types'
import { CONFIG_TABS } from '@/pages/price-configuration/lib/priceConfigurationPageLib'
import { useApi } from '@/features/api/config'
import { savePricingVersion } from '@/features/api/pricingApi'
import {
  loadStoredPricingConfig,
  persistPricingConfig,
} from '@/features/proposal/lib/pricingConfigStore'

export interface UsePriceConfigurationPageArgs {
  draftPrices: Prices
  setDraftPrices: Dispatch<SetStateAction<Prices | null>>
  onActiveTabChange?: (tab: ConfigTabId) => void
}

export function usePriceConfigurationPage({
  draftPrices,
  setDraftPrices,
  onActiveTabChange,
}: UsePriceConfigurationPageArgs) {
  const { state, dispatch } = useProposal()
  const apiEnabled = useApi()
  const [activeTab, setActiveTab] = useState<ConfigTabId>(() => CONFIG_TABS[0].id)
  const hasPendingPriceChanges =
    JSON.stringify(draftPrices) !== JSON.stringify(state.prices)
  const isDefaultDraft = JSON.stringify(draftPrices) === JSON.stringify(DEFAULT_PRICES)
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

  function handleRestore() {
    setDraftPrices(structuredClone(DEFAULT_PRICES))
  }

  async function handleSave() {
    const prices = structuredClone(draftPrices)
    const persisted = loadStoredPricingConfig()
    const baseMonthlyPrice =
      persisted?.baseMonthlyPrice ??
      state.baseMonthlyPrice ??
      DEFAULT_BASE_MONTHLY_PRICE

    if (apiEnabled) {
      const config = await savePricingVersion(prices, baseMonthlyPrice)
      dispatch({
        type: 'COMMIT_PRICING_CONFIG',
        prices: config.prices,
        baseMonthlyPrice: config.baseMonthlyPrice,
        savedAt: config.pricingConfigSavedAt,
      })
      persistPricingConfig(config)
      return
    }

    const pricingConfigSavedAt = Date.now()
    dispatch({
      type: 'COMMIT_PRICING_CONFIG',
      prices,
      baseMonthlyPrice,
      savedAt: pricingConfigSavedAt,
    })
    persistPricingConfig({ prices, baseMonthlyPrice, pricingConfigSavedAt })
  }

  return {
    activeTab,
    setActiveTab,
    activeTabItem,
    hasPendingPriceChanges,
    isDefaultDraft,
    patch,
    handleRestore,
    handleSave,
  }
}
