import type { Prices } from '@/domain/prices'
import { migrateStoredPricingConfig } from '@/domain/jsonMigrate'
import { normalizePrices } from '@/domain/prices'

/** Persistência da tabela de preços global (admin), independente do rascunho da proposta. */
const STORAGE_KEY = 'cservice.ui.calculator.pricing-config.v1'

export interface StoredPricingConfig {
  prices: Prices
  baseMonthlyPrice: number
  pricingConfigSavedAt: number
}

function hasBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isStoredPricingConfig(value: unknown): value is StoredPricingConfig {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.baseMonthlyPrice === 'number' &&
    Number.isFinite(v.baseMonthlyPrice) &&
    typeof v.pricingConfigSavedAt === 'number' &&
    Number.isFinite(v.pricingConfigSavedAt) &&
    v.prices !== null &&
    typeof v.prices === 'object'
  )
}

/** Lê a configuração global salva; retorna null se inexistente ou inválida. */
export function loadStoredPricingConfig(): StoredPricingConfig | null {
  if (!hasBrowserStorage()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    const migrated = migrateStoredPricingConfig(
      (parsed ?? {}) as Record<string, unknown>,
    )
    if (!isStoredPricingConfig(migrated)) return null
    return {
      prices: normalizePrices(structuredClone(migrated.prices as Prices)),
      baseMonthlyPrice: migrated.baseMonthlyPrice,
      pricingConfigSavedAt: migrated.pricingConfigSavedAt,
    }
  } catch {
    return null
  }
}

export function persistPricingConfig(config: StoredPricingConfig): void {
  if (!hasBrowserStorage()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Falha silenciosa: o app continua funcional mesmo sem conseguir persistir.
  }
}
