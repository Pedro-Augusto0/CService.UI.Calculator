import { defaultSections } from '@/domain/calculations'
import { DEFAULT_PRICES } from '@/domain/prices'
import type {
  AdditionalsState,
  MatterServiceKey,
  ProposalSections,
  ReportsState,
} from '@/domain/types'
import { MATTER_SERVICE_KEYS, SECTION_KEYS } from '@/domain/types'
import type { ProposalState } from './proposalActions'
import type { ProposalTemplateSnapshot } from './proposalTemplateSnapshot'
import { proposalSnapshotToState } from './proposalTemplateSnapshot'
import {
  createInitialProposalState,
  emptyAdditionals,
  emptyReports,
  type ProposalStateSeed,
} from './proposalReducer'

export const PROPOSAL_TEMPLATE_IDS = [
  'basic',
  'premium',
  'tv-radio',
  'digital',
] as const

export type ProposalTemplateId = (typeof PROPOSAL_TEMPLATE_IDS)[number]

export type BuiltinTemplateCategory = 'monitoramento' | 'tv-radio' | 'digital'

export interface BuiltinTemplateCardMeta {
  id: ProposalTemplateId
  name: string
  description: string
  category: BuiltinTemplateCategory
  accent: 'violet' | 'green' | 'orange' | 'blue'
  tierLabel: string
  usedInProposals: number
  lastUsedDisplay: string
}

export const BUILTIN_TEMPLATE_CARDS: BuiltinTemplateCardMeta[] = [
  
]

export function isProposalTemplateId(id: string): id is ProposalTemplateId {
  return (PROPOSAL_TEMPLATE_IDS as readonly string[]).includes(id)
}

function matterFlags(
  enabled: Partial<Record<MatterServiceKey, boolean>>,
): Record<MatterServiceKey, boolean> {
  const services = {} as Record<MatterServiceKey, boolean>
  for (const k of MATTER_SERVICE_KEYS) services[k] = enabled[k] ?? false
  return services
}

function sectionsFromMatter(
  services: Record<MatterServiceKey, boolean>,
): ProposalSections {
  const base = defaultSections()
  for (const sk of SECTION_KEYS) {
    base[sk] = {
      ...base[sk],
      keywords: [],
      volume: 0,
      services: { ...services },
    }
  }
  return base
}

interface TemplateDef {
  services: Record<MatterServiceKey, boolean>
  avaliacaoTierId: string | null
  reports: ReportsState
  additionals: AdditionalsState
}

const DEFAULT_AVAL_TIER = DEFAULT_PRICES.matterServices.avaliacao.tiers[1]?.id ?? null

const TEMPLATE_DEFS: Record<ProposalTemplateId, TemplateDef> = {
  basic: {
    services: matterFlags({
      centimetragem: true,
      screenshot: true,
    }),
    avaliacaoTierId: null,
    reports: emptyReports(),
    additionals: emptyAdditionals(),
  },
  premium: {
    services: matterFlags({
      centimetragem: true,
      grifo: true,
      score: true,
      ia: true,
      screenshot: true,
      avaliacao: true,
    }),
    avaliacaoTierId: DEFAULT_AVAL_TIER,
    reports: {
      ...emptyReports(),
      executivoEnabled: true,
      executivoFreq: 'semanal',
    },
    additionals: {
      ...emptyAdditionals(),
      apiCService: true,
      alertasWebRealtime: true,
      midiasSociaisEnabled: true,
      midiasSociaisTierId:
        DEFAULT_PRICES.additionals.midiasSociais.tiers[0]?.id ?? null,
    },
  },
  'tv-radio': {
    services: matterFlags({
      centimetragem: true,
      grifo: true,
      score: true,
      screenshot: true,
    }),
    avaliacaoTierId: null,
    reports: {
      ...emptyReports(),
      executivoEnabled: true,
      executivoFreq: 'semanal',
    },
    additionals: {
      ...emptyAdditionals(),
      tvEnabled: true,
      tvRegion: 'spRj',
      radioEnabled: true,
      radioRegion: 'spRj',
    },
  },
  digital: {
    services: matterFlags({
      centimetragem: true,
      grifo: true,
      score: true,
      screenshot: true,
      ia: true,
    }),
    avaliacaoTierId: null,
    reports: emptyReports(),
    additionals: {
      ...emptyAdditionals(),
      apiCService: true,
      alertasWebRealtime: true,
      midiasSociaisEnabled: true,
      midiasSociaisTierId:
        DEFAULT_PRICES.additionals.midiasSociais.tiers[0]?.id ?? null,
      storiesInstagramEnabled: true,
      storiesInstagramTierId:
        DEFAULT_PRICES.additionals.storiesInstagram.tiers[0]?.id ?? null,
    },
  },
}

export function getBuiltinTemplateSnapshot(
  templateId: ProposalTemplateId,
): ProposalTemplateSnapshot {
  const def = TEMPLATE_DEFS[templateId]
  const initial = createInitialProposalState()

  return {
    sections: sectionsFromMatter(def.services),
    globalBillingMode: 'variable',
    avaliacaoTierId: def.avaliacaoTierId,
    reports: { ...def.reports },
    additionals: { ...def.additionals },
    validadeDias: initial.validadeDias,
    activeScopeTab: 'marcas',
  }
}

export function buildProposalStateFromTemplate(
  templateId: ProposalTemplateId,
  seed: ProposalStateSeed,
): ProposalState {
  return proposalSnapshotToState(getBuiltinTemplateSnapshot(templateId), seed)
}
