import { DEFAULT_PRECO_BASE_MENSAL, DEFAULT_PRICES } from '@/domain/prices'
import { defaultSections } from '@/domain/calculations'
import type {
  AdditionalsState,
  MatterServiceKey,
  ProposalSections,
  ReportsState,
  SectionKey,
} from '@/domain/types'
import { SECTION_KEYS } from '@/domain/types'
import type { ProposalAction, ProposalState } from './proposalActions'

export const STEP_COUNT = 4

export interface ProposalStateSeed {
  precoBaseMensal?: number
  prices?: ProposalState['prices']
  pricingConfigSavedAt?: number
}

const EMPTY_REPORTS: ReportsState = {
  executivoEnabled: false,
  executivoFreq: null,
  estrategicoEnabled: false,
  estrategicoFreq: null,
  biEnabled: false,
}

const EMPTY_ADDITIONALS: AdditionalsState = {
  radioEnabled: false,
  radioRegion: null,
  tvEnabled: false,
  tvRegion: null,
  midiasSociaisEnabled: false,
  midiasSociaisTierId: null,
  storiesInstagramEnabled: false,
  storiesInstagramTierId: null,
  alertasWebRealtime: false,
  apiCService: false,
  newsletterWhatsApp: false,
  newsletterExtraEnvios: 0,
  destinatariosExtrasEnabled: false,
  destinatariosExtrasTierId: null,
  plantaoFimSemana: false,
  curadoriaAprovacaoManual: false,
  aprovacaoAutomatica: false,
}

export function emptyReports(): ReportsState {
  return { ...EMPTY_REPORTS }
}

export function emptyAdditionals(): AdditionalsState {
  return { ...EMPTY_ADDITIONALS }
}

export function createInitialProposalState(
  seed: ProposalStateSeed = {},
): ProposalState {
  const prices = structuredClone(seed.prices ?? DEFAULT_PRICES)
  const validadeDias = prices.validadeOptions[0] ?? 30
  return {
    currentStep: 0,
    meta: {
      clientName: '',
      proposalName: '',
    },
    sections: defaultSections(),
    globalBillingMode: 'variable',
    avaliacaoTierId: null,
    reports: emptyReports(),
    additionals: emptyAdditionals(),
    validadeDias,
    precoBaseMensal: seed.precoBaseMensal ?? DEFAULT_PRECO_BASE_MENSAL,
    prices,
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
  service: MatterServiceKey,
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
      const sections = applyServiceValueToSections(
        state.sections,
        targets,
        action.service,
        nextValue,
      )
      const next: ProposalState = { ...state, sections }
      if (action.service === 'avaliacao' && !nextValue) {
        const anyOn = SECTION_KEYS.some((k) => sections[k].services.avaliacao)
        if (!anyOn) next.avaliacaoTierId = null
      }
      return next
    }
    case 'SET_APPLY_SERVICES_TO_ALL':
      return { ...state, applyServicesToAll: action.value }
    case 'SET_ACTIVE_SCOPE_TAB':
      return { ...state, activeScopeTab: action.section }
    case 'SET_GLOBAL_BILLING_MODE':
      return { ...state, globalBillingMode: action.mode }
    case 'SET_AVALIACAO_TIER':
      return { ...state, avaliacaoTierId: action.tierId }
    case 'SET_REPORTS':
      return { ...state, reports: { ...state.reports, ...action.patch } }
    case 'TOGGLE_REPORT_EXECUTIVO':
      return {
        ...state,
        reports: {
          ...state.reports,
          executivoEnabled: action.enabled,
          executivoFreq: action.enabled ? state.reports.executivoFreq : null,
        },
      }
    case 'SET_REPORT_EXECUTIVO_FREQ':
      return {
        ...state,
        reports: { ...state.reports, executivoFreq: action.freq },
      }
    case 'TOGGLE_REPORT_ESTRATEGICO':
      return {
        ...state,
        reports: {
          ...state.reports,
          estrategicoEnabled: action.enabled,
          estrategicoFreq: action.enabled ? state.reports.estrategicoFreq : null,
        },
      }
    case 'SET_REPORT_ESTRATEGICO_FREQ':
      return {
        ...state,
        reports: { ...state.reports, estrategicoFreq: action.freq },
      }
    case 'TOGGLE_BI':
      return { ...state, reports: { ...state.reports, biEnabled: action.enabled } }
    case 'SET_ADDITIONALS':
      return {
        ...state,
        additionals: { ...state.additionals, ...action.patch },
      }
    case 'TOGGLE_RADIO':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          radioEnabled: action.enabled,
          radioRegion: action.enabled ? state.additionals.radioRegion : null,
        },
      }
    case 'SET_RADIO_REGION':
      return {
        ...state,
        additionals: { ...state.additionals, radioRegion: action.region },
      }
    case 'TOGGLE_TV':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          tvEnabled: action.enabled,
          tvRegion: action.enabled ? state.additionals.tvRegion : null,
        },
      }
    case 'SET_TV_REGION':
      return {
        ...state,
        additionals: { ...state.additionals, tvRegion: action.region },
      }
    case 'TOGGLE_MIDIAS_SOCIAIS':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          midiasSociaisEnabled: action.enabled,
          midiasSociaisTierId: action.enabled
            ? state.additionals.midiasSociaisTierId
            : null,
        },
      }
    case 'SET_MIDIAS_SOCIAIS_TIER':
      return {
        ...state,
        additionals: { ...state.additionals, midiasSociaisTierId: action.tierId },
      }
    case 'TOGGLE_STORIES_INSTAGRAM':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          storiesInstagramEnabled: action.enabled,
          storiesInstagramTierId: action.enabled
            ? state.additionals.storiesInstagramTierId
            : null,
        },
      }
    case 'SET_STORIES_INSTAGRAM_TIER':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          storiesInstagramTierId: action.tierId,
        },
      }
    case 'TOGGLE_DESTINATARIOS_EXTRAS':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          destinatariosExtrasEnabled: action.enabled,
          destinatariosExtrasTierId: action.enabled
            ? state.additionals.destinatariosExtrasTierId
            : null,
        },
      }
    case 'SET_DESTINATARIOS_EXTRAS_TIER':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          destinatariosExtrasTierId: action.tierId,
        },
      }
    case 'SET_NEWSLETTER_EXTRA_ENVIOS':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          newsletterExtraEnvios: Math.max(0, Math.floor(action.value)),
        },
      }
    case 'SET_VALIDADE_DIAS':
      return { ...state, validadeDias: Math.max(0, Math.floor(action.dias)) }
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
