import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import {
  DEFAULT_PRECO_BASE_MENSAL,
  DEFAULT_PRICES,
  type Prices,
} from '@/domain/prices'
import type { ConfigTabId } from '@/features/pricing-config/types'
import { CONFIG_TABS } from '@/pages/price-configuration/lib/priceConfigurationPageLib'

export interface UsePriceConfigurationPageArgs {
  draftPrices: Prices
  setDraftPrices: Dispatch<SetStateAction<Prices | null>>
  draftPrecoBaseMensal: number
  setDraftPrecoBaseMensal: Dispatch<SetStateAction<number | null>>
  onActiveTabChange?: (tab: ConfigTabId) => void
}

export function usePriceConfigurationPage({
  draftPrices,
  setDraftPrices,
  draftPrecoBaseMensal,
  setDraftPrecoBaseMensal,
  onActiveTabChange,
}: UsePriceConfigurationPageArgs) {
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

  function handleRestore() {
    setDraftPrices(structuredClone(DEFAULT_PRICES))
    setDraftPrecoBaseMensal(DEFAULT_PRECO_BASE_MENSAL)
  }

  function handleSave() {
    dispatch({
      type: 'COMMIT_PRICING_CONFIG',
      prices: structuredClone(draftPrices),
      precoBaseMensal: draftPrecoBaseMensal,
    })
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
