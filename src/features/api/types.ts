import type { Prices } from '@/domain/prices'
import type { ProposalState } from '@/features/proposal/lib/proposalActions'
import type { SavedProposalStatus } from '@/features/proposal/lib/savedProposalStore'

export interface ApiAuthUser {
  id: number
  name: string
  email: string
  isAdmin: boolean
  isMasterAdmin: boolean
}

export interface ApiAuthResponse {
  user: ApiAuthUser
  token: string
  expiresAt: string
}

export interface ApiPricingConfig {
  versionId: number
  prices: Prices
  baseMonthlyPrice: number
  pricingConfigSavedAt: number
}

export interface ApiProposalDetail {
  id: number
  status: SavedProposalStatus
  clientId?: number | null
  createdAt: number
  updatedAt: number
  state: ProposalState
}

export interface ApiClient {
  id: number
  name: string
  isActive: boolean
  createdAt: number
}

export interface ApiProposalListItem {
  id: number
  name: string
  status: SavedProposalStatus
  clientName: string
  clientId: number | null
  createdAt: number
  updatedAt: number
  pricingConfigVersionId: number
}

export interface ApiPagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ApiUserListItem {
  id: number
  name: string
  email: string
  isAdmin: boolean
  isMasterAdmin: boolean
  isActive: boolean
  createdAt: number
}
