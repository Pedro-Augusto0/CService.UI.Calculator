import { DEFAULT_PRECO_BASE_MENSAL, DEFAULT_PRICES } from '../domain/prices'
import { defaultSections } from '../domain/calculations'
import type { ProposalSections, SectionKey, MonitoringServiceKey } from '../domain/types'
import { SECTION_KEYS } from '../domain/types'
import type { ProposalAction, ProposalState } from './proposalActions'

export const STEP_COUNT = 4

interface ProposalStateSeed {
  precoBaseMensal?: number
  prices?: ProposalState['prices']
  pricingConfigSavedAt?: number
}

export function createInitialProposalState(
  seed: ProposalStateSeed = {},
): ProposalState {
  return {
    currentStep: 0,
    meta: {
      clientName: '',
      proposalName: '',
    },
    sections: defaultSections(),
    broadcast: {
      tvEnabled: false,
      tvRegion: '',
      radioEnabled: false,
      radioRegion: '',
      relatorioEnabled: false,
      relatorioFreq: '',
    },
    additionals: {
      midiasSociais: false,
      alertasWeb: false,
      api: false,
      stories: false,
      destaques: false,
    },
    operational: {
      enviosDiarios: 1,
      numDestinatarios: 5,
      envioFeriadosFds: false,
      aprovacaoAutomatica: false,
    },
    precoBaseMensal: seed.precoBaseMensal ?? DEFAULT_PRECO_BASE_MENSAL,
    prices: structuredClone(seed.prices ?? DEFAULT_PRICES),
    applyServicesToAll: false,
    activeScopeTab: 'marcas',
    savedProposalId: null,
    lastSavedAt: null,
    pricingConfigSavedAt: seed.pricingConfigSavedAt ?? Date.now(),
  }
}

function applyServiceValueToSections(
  sections: ProposalSections,
  targets: SectionKey[],
  service: MonitoringServiceKey,
  value: boolean,
): ProposalSections {
  const next = { ...sections }
  for (const key of targets) {
    const sec = next[key]
    next[key] = {
      ...sec,
      services: { ...sec.services, [service]: value },
    }
  }
  return next
}

export function proposalReducer(
  state: ProposalState,
  action: ProposalAction,
): ProposalState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(STEP_COUNT - 1, action.step)),
      }
    case 'LOAD_PROPOSAL_STATE':
      return structuredClone(action.state)
    case 'RESET_PROPOSAL':
      return createInitialProposalState({
        precoBaseMensal: state.precoBaseMensal,
        prices: state.prices,
        pricingConfigSavedAt: state.pricingConfigSavedAt,
      })
    case 'SET_PROPOSAL_META':
      return { ...state, meta: { ...state.meta, ...action.patch } }
    case 'SET_SECTION_KEYWORDS':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: {
            ...state.sections[action.section],
            keywords: action.keywords,
          },
        },
      }
    case 'SET_SECTION_VOLUME':
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: {
            ...state.sections[action.section],
            volume: Math.max(0, action.volume),
          },
        },
      }
    case 'TOGGLE_SECTION_SERVICE': {
      const current =
        state.sections[action.section].services[action.service]
      const nextValue = !current
      const targets: SectionKey[] = state.applyServicesToAll
        ? [...SECTION_KEYS]
        : [action.section]
      return {
        ...state,
        sections: applyServiceValueToSections(
          state.sections,
          targets,
          action.service,
          nextValue,
        ),
      }
    }
    case 'SET_BROADCAST':
      return { ...state, broadcast: { ...state.broadcast, ...action.patch } }
    case 'SET_ADDITIONALS':
      return {
        ...state,
        additionals: { ...state.additionals, ...action.patch },
      }
    case 'SET_OPERATIONAL':
      return {
        ...state,
        operational: { ...state.operational, ...action.patch },
      }
    case 'SET_PRECO_BASE_MENSAL':
      return {
        ...state,
        precoBaseMensal: Math.max(0, action.value),
        pricingConfigSavedAt: Date.now(),
      }
    case 'SET_PRICES':
      return {
        ...state,
        prices: structuredClone(action.prices),
        pricingConfigSavedAt: Date.now(),
      }
    case 'COMMIT_PRICING_CONFIG':
      return {
        ...state,
        prices: structuredClone(action.prices),
        precoBaseMensal: Math.max(0, action.precoBaseMensal),
        pricingConfigSavedAt: Date.now(),
      }
    case 'SET_APPLY_SERVICES_TO_ALL':
      return { ...state, applyServicesToAll: action.value }
    case 'SET_ACTIVE_SCOPE_TAB':
      return { ...state, activeScopeTab: action.section }
    case 'MARK_PROPOSAL_SAVED':
      return {
        ...state,
        savedProposalId: action.id,
        lastSavedAt: action.savedAt,
      }
    default:
      return state
  }
}
