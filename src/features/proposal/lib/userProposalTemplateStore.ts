import {
  isProposalTemplateSnapshot,
  type ProposalTemplateSnapshot,
} from './proposalTemplateSnapshot'
import { createSavedProposalId } from './savedProposalStore'

const STORAGE_KEY = 'cservice.ui.calculator.user-proposal-templates.v2'
const LEGACY_STORAGE_KEYS = ['cservice.ui.calculator.user-proposal-templates.v1']

function hasBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function clearLegacyStorage() {
  if (!hasBrowserStorage()) return
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // falha silenciosa
    }
  }
}

export interface UserProposalTemplateRecord {
  id: string
  name: string
  description: string
  snapshot: ProposalTemplateSnapshot
  createdAt: number
  updatedAt: number
  /** Quantas propostas iniciaram a partir deste modelo (local). */
  usedCount: number
  lastUsedAt: number | null
}

function tryParseUserProposalTemplateRecord(
  value: unknown,
): UserProposalTemplateRecord | null {
  if (!value || typeof value !== 'object') return null
  const r = value as Record<string, unknown>
  if (
    typeof r.id !== 'string'
    || typeof r.name !== 'string'
    || typeof r.description !== 'string'
    || !isProposalTemplateSnapshot(r.snapshot)
    || typeof r.createdAt !== 'number'
    || typeof r.updatedAt !== 'number'
  ) {
    return null
  }

  const usedCount = typeof r.usedCount === 'number' ? r.usedCount : 0
  let lastUsedAt: number | null = null
  if (typeof r.lastUsedAt === 'number') {
    lastUsedAt = r.lastUsedAt
  }

  return {
    id: r.id,
    name: r.name,
    description: r.description,
    snapshot: r.snapshot,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    usedCount,
    lastUsedAt,
  }
}

export function sortUserProposalTemplates(
  records: UserProposalTemplateRecord[],
): UserProposalTemplateRecord[] {
  return [...records].sort((left, right) => right.updatedAt - left.updatedAt)
}

export function loadUserProposalTemplates(): UserProposalTemplateRecord[] {
  if (!hasBrowserStorage()) return []
  clearLegacyStorage()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return sortUserProposalTemplates(
      parsed
        .map((item) => tryParseUserProposalTemplateRecord(item))
        .filter((r): r is UserProposalTemplateRecord => r !== null),
    )
  } catch {
    return []
  }
}

export function persistUserProposalTemplates(records: UserProposalTemplateRecord[]): void {
  if (!hasBrowserStorage()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // falha silenciosa
  }
}

export function createUserProposalTemplateRecord(
  name: string,
  description: string,
  snapshot: ProposalTemplateSnapshot,
): UserProposalTemplateRecord {
  const now = Date.now()
  return {
    id: createSavedProposalId(),
    name,
    description,
    snapshot,
    createdAt: now,
    updatedAt: now,
    usedCount: 0,
    lastUsedAt: null,
  }
}
