import type { Dispatch, SetStateAction } from 'react'
import type { Prices } from '@/domain/prices'
import type { ConfigTabId } from '@/features/pricing-config/types'
import { PriceConfigurationView } from '@/pages/price-configuration/components/PriceConfigurationView'
import { usePriceConfigurationPage } from '@/pages/price-configuration/hooks/usePriceConfigurationPage'
import './PriceConfiguration.css'

interface PriceConfigurationProps {
  draftPrices: Prices
  setDraftPrices: Dispatch<SetStateAction<Prices | null>>
  onActiveTabChange?: (tab: ConfigTabId) => void
}

export function PriceConfiguration({
  draftPrices,
  setDraftPrices,
  onActiveTabChange,
}: PriceConfigurationProps) {
  const p = usePriceConfigurationPage({
    draftPrices,
    setDraftPrices,
    onActiveTabChange,
  })

  return (
    <PriceConfigurationView
      draftPrices={draftPrices}
      activeTab={p.activeTab}
      setActiveTab={p.setActiveTab}
      activeTabItem={p.activeTabItem}
      hasPendingPriceChanges={p.hasPendingPriceChanges}
      isDefaultDraft={p.isDefaultDraft}
      patch={p.patch}
      handleRestore={p.handleRestore}
      handleSave={p.handleSave}
    />
  )
}
