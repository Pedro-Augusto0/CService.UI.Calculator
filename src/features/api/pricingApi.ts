import type { Prices } from '@/domain/prices'
import { migratePrices } from '@/domain/jsonMigrate'
import type { StoredPricingConfig } from '@/features/proposal/lib/pricingConfigStore'
import { apiRequest } from './client'
import type { ApiPricingConfig } from './types'

function toStoredConfig(config: ApiPricingConfig): StoredPricingConfig {
  return {
    prices: migratePrices(config.prices),
    baseMonthlyPrice: config.baseMonthlyPrice,
    pricingConfigSavedAt: config.pricingConfigSavedAt,
  }
}

export async function fetchCurrentPricing(): Promise<StoredPricingConfig> {
  const config = await apiRequest<ApiPricingConfig>('/api/pricing-config/current')
  return toStoredConfig(config)
}

export async function savePricingVersion(
  prices: Prices,
  baseMonthlyPrice: number,
): Promise<StoredPricingConfig> {
  const config = await apiRequest<ApiPricingConfig>('/api/pricing-config/versions', {
    method: 'POST',
    body: { prices, baseMonthlyPrice },
  })
  return toStoredConfig(config)
}
