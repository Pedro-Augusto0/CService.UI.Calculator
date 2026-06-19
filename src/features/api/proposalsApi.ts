import type { ProposalState } from '@/features/proposal/lib/proposalActions'
import { migrateSavedProposalRecord, migrateProposalState } from '@/domain/jsonMigrate'
import type {
  SavedProposalRecord,
  SavedProposalStatus,
} from '@/features/proposal/lib/savedProposalStore'
import { apiRequest } from './client'
import type { ApiPagedResult, ApiProposalDetail, ApiProposalListItem } from './types'

function detailToRecord(detail: ApiProposalDetail): SavedProposalRecord {
  const migratedState = migrateProposalState(
    structuredClone(detail.state) as unknown as Record<string, unknown>,
  ) as unknown as ProposalState

  if (detail.clientId != null && migratedState.meta.clientId == null) {
    migratedState.meta.clientId = detail.clientId
  }

  return migrateSavedProposalRecord({
    id: String(detail.id),
    proposalNumber: detail.id,
    status: detail.status,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    state: migratedState,
  }) as SavedProposalRecord
}

function listItemToRecord(item: ApiProposalListItem): SavedProposalRecord {
  return {
    id: String(item.id),
    proposalNumber: item.id,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    state: {
      currentStep: 0,
      meta: {
        clientName: item.clientName,
        proposalName: item.name,
        clientId: item.clientId,
      },
      sections: {
        brands: { keywords: [], volume: 0, services: {} as never },
        competitors: { keywords: [], volume: 0, services: {} as never },
        sector: { keywords: [], volume: 0, services: {} as never },
      },
      globalBillingMode: 'variable',
      assessmentTierId: null,
      reports: {} as never,
      additionals: {} as never,
      validityDays: 30,
      baseMonthlyPrice: 0,
      prices: {} as never,
      activeScopeTab: 'brands',
      totalDiscountPercent: 0,
      wizardVersion: 2,
      savedProposalId: String(item.id),
      lastSavedAt: item.updatedAt,
      pricingConfigSavedAt: 0,
    },
  }
}

export async function fetchProposals(): Promise<SavedProposalRecord[]> {
  const result = await apiRequest<ApiPagedResult<ApiProposalListItem>>(
    '/api/proposals?page=1&pageSize=100&sort=recentes',
  )
  const records = await Promise.all(
    result.items.map(async (item) => {
      try {
        return await fetchProposalById(String(item.id))
      } catch {
        return listItemToRecord(item)
      }
    }),
  )
  return records
}

export async function fetchProposalById(id: string): Promise<SavedProposalRecord> {
  const detail = await apiRequest<ApiProposalDetail>(`/api/proposals/${id}`)
  return detailToRecord(detail)
}

export async function createProposal(
  state: ProposalState,
  status: SavedProposalStatus = 'draft',
): Promise<SavedProposalRecord> {
  const detail = await apiRequest<ApiProposalDetail>('/api/proposals', {
    method: 'POST',
    body: {
      state,
      status,
      clientId: state.meta.clientId,
    },
  })
  return detailToRecord(detail)
}

export async function updateProposal(
  id: string,
  state: ProposalState,
): Promise<SavedProposalRecord> {
  const detail = await apiRequest<ApiProposalDetail>(`/api/proposals/${id}`, {
    method: 'PUT',
    body: {
      state,
      clientId: state.meta.clientId,
    },
  })
  return detailToRecord(detail)
}

export async function updateProposalStatusApi(
  id: string,
  status: SavedProposalStatus,
): Promise<void> {
  await apiRequest(`/api/proposals/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export async function duplicateProposalApi(id: string): Promise<SavedProposalRecord> {
  const detail = await apiRequest<ApiProposalDetail>(`/api/proposals/${id}/duplicate`, {
    method: 'POST',
  })
  return detailToRecord(detail)
}
