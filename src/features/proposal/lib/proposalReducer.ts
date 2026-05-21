import { DEFAULT_PRICES, normalizePrices } from '@/domain/prices'
import { defaultSections } from '@/domain/calculations'
import type {
  AdditionalsState,
  MatterServiceKey,
  ProposalSections,
  RegionKey,
  ReportsState,
  SectionKey,
} from '@/domain/types'
import { SECTION_KEYS } from '@/domain/types'
import type { ProposalAction, ProposalState } from './proposalActions'

export const STEP_COUNT = 5

/** Validade comercial fixa até reativarmos o seletor nas propostas. */
export const FIXED_PROPOSAL_VALIDADE_DIAS = 30

export interface ProposalStateSeed {
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
  impressoEnabled: false,
  webNacionalEnabled: false,
  webInternacionalEnabled: false,
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

type LegacyAdditionalsInput = Partial<AdditionalsState> & {
  impressoRegion?: RegionKey | null
  webEnabled?: boolean
  webRegion?: RegionKey | null
}

/** Mescla dados persistidos (incl. formato legado com região em impresso/web). */
export function coerceLoadedAdditionals(raw: unknown): AdditionalsState {
  const e = emptyAdditionals()
  if (!raw || typeof raw !== 'object') return e
  const r = raw as LegacyAdditionalsInput
  const webNacional =
    typeof r.webNacionalEnabled === 'boolean'
      ? r.webNacionalEnabled
      : Boolean(r.webEnabled === true && r.webRegion != null)
  return {
    ...e,
    impressoEnabled: Boolean(r.impressoEnabled),
    webNacionalEnabled: webNacional,
    webInternacionalEnabled: Boolean(r.webInternacionalEnabled),
    radioEnabled: Boolean(r.radioEnabled),
    radioRegion: r.radioRegion ?? null,
    tvEnabled: Boolean(r.tvEnabled),
    tvRegion: r.tvRegion ?? null,
    midiasSociaisEnabled: Boolean(r.midiasSociaisEnabled),
    midiasSociaisTierId: r.midiasSociaisTierId ?? null,
    storiesInstagramEnabled: Boolean(r.storiesInstagramEnabled),
    storiesInstagramTierId: r.storiesInstagramTierId ?? null,
    alertasWebRealtime: Boolean(r.alertasWebRealtime),
    apiCService: Boolean(r.apiCService),
    newsletterWhatsApp: Boolean(r.newsletterWhatsApp),
    newsletterExtraEnvios: Math.max(0, Math.floor(Number(r.newsletterExtraEnvios) || 0)),
    destinatariosExtrasEnabled: Boolean(r.destinatariosExtrasEnabled),
    destinatariosExtrasTierId: r.destinatariosExtrasTierId ?? null,
    plantaoFimSemana: Boolean(r.plantaoFimSemana),
    curadoriaAprovacaoManual: Boolean(r.curadoriaAprovacaoManual),
    aprovacaoAutomatica: Boolean(r.aprovacaoAutomatica),
  }
}

export function createInitialProposalState(
  seed: ProposalStateSeed = {},
): ProposalState {
  const prices = normalizePrices(structuredClone(seed.prices ?? DEFAULT_PRICES))
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
    validadeDias: FIXED_PROPOSAL_VALIDADE_DIAS,
    precoBaseMensal: 0,
    prices,
    activeScopeTab: 'marcas',
    /** 2 = assistente com 5 etapas; ausente/<2 trata como fluxo legado de 4 etapas ao carregar. */
    wizardVersion: 2,
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
    case 'LOAD_PROPOSAL_STATE': {
      const raw = structuredClone(action.state) as ProposalState & {
        applyServicesToAll?: boolean
      }
      const { applyServicesToAll: _legacyApplyAll, ...rawRest } = raw
      void _legacyApplyAll
      const legacyWizard = (rawRest.wizardVersion ?? 1) < 2
      let currentStep = rawRest.currentStep
      if (legacyWizard && (currentStep === 2 || currentStep === 3)) {
        currentStep = currentStep + 1
      }
      return {
        ...rawRest,
        currentStep,
        wizardVersion: 2,
        prices: normalizePrices(structuredClone(rawRest.prices)),
        additionals: coerceLoadedAdditionals(structuredClone(rawRest.additionals)),
        validadeDias: FIXED_PROPOSAL_VALIDADE_DIAS,
        precoBaseMensal: 0,
      }
    }
    case 'RESET_PROPOSAL':
      return createInitialProposalState({
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
      const sections = applyServiceValueToSections(
        state.sections,
        [action.section],
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
    case 'TOGGLE_IMPRESSO':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          impressoEnabled: action.enabled,
        },
      }
    case 'TOGGLE_WEB_NACIONAL':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          webNacionalEnabled: action.enabled,
        },
      }
    case 'TOGGLE_WEB_INTERNACIONAL':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          webInternacionalEnabled: action.enabled,
        },
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
      return { ...state, validadeDias: FIXED_PROPOSAL_VALIDADE_DIAS }
    case 'SET_PRECO_BASE_MENSAL':
      return { ...state, precoBaseMensal: 0 }
    case 'SET_PRICES':
      return {
        ...state,
        prices: normalizePrices(structuredClone(action.prices)),
        pricingConfigSavedAt: Date.now(),
      }
    case 'COMMIT_PRICING_CONFIG':
      return {
        ...state,
        prices: normalizePrices(structuredClone(action.prices)),
        precoBaseMensal: 0,
        pricingConfigSavedAt: action.savedAt ?? Date.now(),
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
