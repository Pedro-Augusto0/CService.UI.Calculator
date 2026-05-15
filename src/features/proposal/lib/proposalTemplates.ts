import { defaultSections } from '@/domain/calculations'
import type { MonitoringServiceKey, ProposalSections } from '@/domain/types'
import { MONITORING_SERVICE_KEYS, SECTION_KEYS } from '@/domain/types'
import type { ProposalState } from './proposalActions'
import type { ProposalTemplateSnapshot } from './proposalTemplateSnapshot'
import { proposalSnapshotToState } from './proposalTemplateSnapshot'
import { createInitialProposalState, type ProposalStateSeed } from './proposalReducer'

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
  /** Texto orientando o usuário sobre quando usar o modelo */
  description: string
  category: BuiltinTemplateCategory
  accent: 'violet' | 'green' | 'orange' | 'blue'
  tierLabel: string
  usedInProposals: number
  lastUsedDisplay: string
}

export const BUILTIN_TEMPLATE_CARDS: BuiltinTemplateCardMeta[] = [
  {
    id: 'basic',
    name: 'Monitoramento Básico',
    description:
      'Pacote inicial para acompanhar notícias em texto integral e clipping objetivo.',
    category: 'monitoramento',
    accent: 'violet',
    tierLabel: 'Básico',
    usedInProposals: 28,
    lastUsedDisplay: '12/05/2026',
  },
  {
    id: 'premium',
    name: 'Monitoramento Premium',
    description:
      'Todos os serviços de leitura com IA e relatórios analíticos. Ideal para operações que precisam de interpretação e insights.',
    category: 'monitoramento',
    accent: 'green',
    tierLabel: 'Avançado',
    usedInProposals: 45,
    lastUsedDisplay: '10/05/2026',
  },
  {
    id: 'tv-radio',
    name: 'TV + Rádio',
    description:
      'Monitoramento textual combinado com TV e rádio em SP/RJ e relatório semanal. Use quando a proposta precisa de presença em broadcast tradicional além do clipping digital.',
    category: 'tv-radio',
    accent: 'orange',
    tierLabel: 'Broadcast',
    usedInProposals: 18,
    lastUsedDisplay: '08/05/2026',
  },
  {
    id: 'digital',
    name: 'Digital Completo',
    description:
      'Foco em ambiente digital: monitoramento com IA e pacote de extras (API, alertas web, mídias sociais, stories). A taxa de envio e destinatários já vem calibrada para rotina mais intensa.',
    category: 'digital',
    accent: 'blue',
    tierLabel: 'Digital',
    usedInProposals: 21,
    lastUsedDisplay: '05/05/2026',
  },
]

export function isProposalTemplateId(id: string): id is ProposalTemplateId {
  return (PROPOSAL_TEMPLATE_IDS as readonly string[]).includes(id)
}

const BROADCAST_OFF: ProposalState['broadcast'] = {
  tvEnabled: false,
  tvRegion: '',
  radioEnabled: false,
  radioRegion: '',
  relatorioEnabled: false,
  relatorioFreq: '',
}

function monitoringFromFlags(
  enabled: Partial<Record<MonitoringServiceKey, boolean>>,
): Record<MonitoringServiceKey, boolean> {
  const services = {} as Record<MonitoringServiceKey, boolean>
  for (const k of MONITORING_SERVICE_KEYS) {
    services[k] = enabled[k] ?? false
  }
  return services
}

function sectionsFromMonitoring(
  services: Record<MonitoringServiceKey, boolean>,
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

const TEMPLATE_DEFS: Record<
  ProposalTemplateId,
  {
    sections: Record<MonitoringServiceKey, boolean>
    operational: Partial<ProposalState['operational']>
    broadcast: ProposalState['broadcast']
    additionals: Partial<ProposalState['additionals']>
    applyServicesToAll: boolean
  }
> = {
  basic: {
    sections: monitoringFromFlags({
      texto: true,
      centimetragem: true,
      screenshot: true,
    }),
    operational: { enviosDiarios: 1, numDestinatarios: 3 },
    broadcast: BROADCAST_OFF,
    additionals: {},
    applyServicesToAll: true,
  },
  premium: {
    sections: monitoringFromFlags({
      texto: true,
      grifo: true,
      score: true,
      avaliacao: true,
      ia: true,
      screenshot: true,
    }),
    operational: { enviosDiarios: 2, numDestinatarios: 10 },
    broadcast: {
      ...BROADCAST_OFF,
      relatorioEnabled: true,
      relatorioFreq: 'semanal',
    },
    additionals: {
      api: true,
      alertasWeb: true,
      midiasSociais: true,
    },
    applyServicesToAll: true,
  },
  'tv-radio': {
    sections: monitoringFromFlags({
      texto: true,
      centimetragem: true,
      grifo: true,
      score: true,
      screenshot: true,
    }),
    operational: { enviosDiarios: 1, numDestinatarios: 5 },
    broadcast: {
      tvEnabled: true,
      tvRegion: 'sp_rj',
      radioEnabled: true,
      radioRegion: 'sp_rj',
      relatorioEnabled: true,
      relatorioFreq: 'semanal',
    },
    additionals: {},
    applyServicesToAll: true,
  },
  digital: {
    sections: monitoringFromFlags({
      texto: true,
      centimetragem: true,
      grifo: true,
      score: true,
      screenshot: true,
      ia: true,
    }),
    operational: { enviosDiarios: 2, numDestinatarios: 8 },
    broadcast: BROADCAST_OFF,
    additionals: {
      api: true,
      alertasWeb: true,
      midiasSociais: true,
      stories: true,
    },
    applyServicesToAll: true,
  },
}

export function getBuiltinTemplateSnapshot(
  templateId: ProposalTemplateId,
): ProposalTemplateSnapshot {
  const def = TEMPLATE_DEFS[templateId]
  const initial = createInitialProposalState()

  return {
    sections: sectionsFromMonitoring(def.sections),
    broadcast: { ...def.broadcast },
    additionals: {
      ...initial.additionals,
      ...def.additionals,
    },
    operational: {
      ...initial.operational,
      ...def.operational,
    },
    applyServicesToAll: def.applyServicesToAll,
    activeScopeTab: 'marcas',
  }
}

export function buildProposalStateFromTemplate(
  templateId: ProposalTemplateId,
  seed: ProposalStateSeed,
): ProposalState {
  return proposalSnapshotToState(getBuiltinTemplateSnapshot(templateId), seed)
}
