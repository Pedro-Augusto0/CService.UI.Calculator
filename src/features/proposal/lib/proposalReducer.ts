import { DEFAULT_PRICES, normalizePrices } from '@/domain/prices'
import { defaultSections } from '@/domain/calculations'
import { migrateProposalState } from '@/domain/jsonMigrate'
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
export const FIXED_PROPOSAL_VALIDITY_DAYS = 30

function clampTotalDiscountPercent(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export interface ProposalStateSeed {
  prices?: ProposalState['prices']
  pricingConfigSavedAt?: number
}

const EMPTY_REPORTS: ReportsState = {
  executiveEnabled: false,
  executiveFrequency: null,
  strategicEnabled: false,
  strategicFrequency: null,
  biEnabled: false,
}

const EMPTY_ADDITIONALS: AdditionalsState = {
  printEnabled: false,
  webNationalEnabled: false,
  webInternationalEnabled: false,
  radioEnabled: false,
  radioRegion: null,
  tvEnabled: false,
  tvRegion: null,
  socialMediaEnabled: false,
  socialMediaTierId: null,
  storiesInstagramEnabled: false,
  storiesInstagramTierId: null,
  webRealtimeAlerts: false,
  apiCService: false,
  newsletterWhatsApp: false,
  newsletterExtraSends: 0,
  extraRecipientsEnabled: false,
  extraRecipientsTierId: null,
  weekendOnCall: false,
  manualCuration: false,
  autoApproval: false,
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

/** Mescla dados persistidos (incl. formato legado com região em print/web). */
export function coerceLoadedAdditionals(raw: unknown): AdditionalsState {
  const migrated = migrateProposalState({ additionals: raw }) as {
    additionals: LegacyAdditionalsInput
  }
  const e = emptyAdditionals()
  const r = migrated.additionals
  if (!r || typeof r !== 'object') return e

  const webNational =
    typeof r.webNationalEnabled === 'boolean'
      ? r.webNationalEnabled
      : Boolean(r.webEnabled === true && r.webRegion != null)

  return {
    ...e,
    printEnabled: Boolean(r.printEnabled),
    webNationalEnabled: webNational,
    webInternationalEnabled: Boolean(r.webInternationalEnabled),
    radioEnabled: Boolean(r.radioEnabled),
    radioRegion: r.radioRegion ?? null,
    tvEnabled: Boolean(r.tvEnabled),
    tvRegion: r.tvRegion ?? null,
    socialMediaEnabled: Boolean(r.socialMediaEnabled),
    socialMediaTierId: r.socialMediaTierId ?? null,
    storiesInstagramEnabled: Boolean(r.storiesInstagramEnabled),
    storiesInstagramTierId: r.storiesInstagramTierId ?? null,
    webRealtimeAlerts: Boolean(r.webRealtimeAlerts),
    apiCService: Boolean(r.apiCService),
    newsletterWhatsApp: Boolean(r.newsletterWhatsApp),
    newsletterExtraSends: Math.max(0, Math.floor(Number(r.newsletterExtraSends) || 0)),
    extraRecipientsEnabled: Boolean(r.extraRecipientsEnabled),
    extraRecipientsTierId: r.extraRecipientsTierId ?? null,
    weekendOnCall: Boolean(r.weekendOnCall),
    manualCuration: Boolean(r.manualCuration),
    autoApproval: Boolean(r.autoApproval),
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
      clientId: null,
    },
    sections: defaultSections(),
    globalBillingMode: 'variable',
    assessmentTierId: null,
    reports: emptyReports(),
    additionals: emptyAdditionals(),
    validityDays: FIXED_PROPOSAL_VALIDITY_DAYS,
    baseMonthlyPrice: 0,
    prices,
    activeScopeTab: 'brands',
    totalDiscountPercent: 0,
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
      const { applyServicesToAll: _legacyApplyAll, ...rawRest } = migrateProposalState(
        raw as unknown as Record<string, unknown>,
      ) as unknown as ProposalState & { applyServicesToAll?: boolean }
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
        meta: {
          ...rawRest.meta,
          clientId: rawRest.meta?.clientId ?? null,
        },
        prices: normalizePrices(structuredClone(rawRest.prices)),
        additionals: coerceLoadedAdditionals(structuredClone(rawRest.additionals)),
        validityDays: FIXED_PROPOSAL_VALIDITY_DAYS,
        baseMonthlyPrice: 0,
        totalDiscountPercent: clampTotalDiscountPercent(rawRest.totalDiscountPercent),
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
      if (action.service === 'assessment' && !nextValue) {
        const anyOn = SECTION_KEYS.some((k) => sections[k].services.assessment)
        if (!anyOn) next.assessmentTierId = null
      }
      return next
    }
    case 'SET_ACTIVE_SCOPE_TAB':
      return { ...state, activeScopeTab: action.section }
    case 'SET_GLOBAL_BILLING_MODE':
      return { ...state, globalBillingMode: action.mode }
    case 'SET_ASSESSMENT_TIER':
      return { ...state, assessmentTierId: action.tierId }
    case 'SET_REPORTS':
      return { ...state, reports: { ...state.reports, ...action.patch } }
    case 'TOGGLE_REPORT_EXECUTIVE':
      return {
        ...state,
        reports: {
          ...state.reports,
          executiveEnabled: action.enabled,
          executiveFrequency: action.enabled ? state.reports.executiveFrequency : null,
        },
      }
    case 'SET_REPORT_EXECUTIVE_FREQUENCY':
      return {
        ...state,
        reports: { ...state.reports, executiveFrequency: action.freq },
      }
    case 'TOGGLE_REPORT_STRATEGIC':
      return {
        ...state,
        reports: {
          ...state.reports,
          strategicEnabled: action.enabled,
          strategicFrequency: action.enabled ? state.reports.strategicFrequency : null,
        },
      }
    case 'SET_REPORT_STRATEGIC_FREQUENCY':
      return {
        ...state,
        reports: { ...state.reports, strategicFrequency: action.freq },
      }
    case 'TOGGLE_BI':
      return { ...state, reports: { ...state.reports, biEnabled: action.enabled } }
    case 'SET_ADDITIONALS':
      return {
        ...state,
        additionals: { ...state.additionals, ...action.patch },
      }
    case 'TOGGLE_PRINT':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          printEnabled: action.enabled,
        },
      }
    case 'TOGGLE_WEB_NATIONAL':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          webNationalEnabled: action.enabled,
        },
      }
    case 'TOGGLE_WEB_INTERNATIONAL':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          webInternationalEnabled: action.enabled,
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
    case 'TOGGLE_SOCIAL_MEDIA':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          socialMediaEnabled: action.enabled,
          socialMediaTierId: action.enabled
            ? state.additionals.socialMediaTierId
            : null,
        },
      }
    case 'SET_SOCIAL_MEDIA_TIER':
      return {
        ...state,
        additionals: { ...state.additionals, socialMediaTierId: action.tierId },
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
    case 'TOGGLE_EXTRA_RECIPIENTS':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          extraRecipientsEnabled: action.enabled,
          extraRecipientsTierId: action.enabled
            ? state.additionals.extraRecipientsTierId
            : null,
        },
      }
    case 'SET_EXTRA_RECIPIENTS_TIER':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          extraRecipientsTierId: action.tierId,
        },
      }
    case 'SET_NEWSLETTER_EXTRA_SENDS':
      return {
        ...state,
        additionals: {
          ...state.additionals,
          newsletterExtraSends: Math.max(0, Math.floor(action.value)),
        },
      }
    case 'SET_VALIDITY_DAYS':
      return { ...state, validityDays: FIXED_PROPOSAL_VALIDITY_DAYS }
    case 'SET_BASE_MONTHLY_PRICE':
      return { ...state, baseMonthlyPrice: 0 }
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
        baseMonthlyPrice: action.baseMonthlyPrice ?? state.baseMonthlyPrice,
        pricingConfigSavedAt: action.savedAt ?? Date.now(),
      }
    case 'MARK_PROPOSAL_SAVED':
      return {
        ...state,
        savedProposalId: action.id,
        lastSavedAt: action.savedAt,
      }
    case 'SET_TOTAL_DISCOUNT_PERCENT':
      return {
        ...state,
        totalDiscountPercent: clampTotalDiscountPercent(action.percent),
      }
    default:
      return state
  }
}
