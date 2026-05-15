import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearUrlHash,
  readHashConfigPrecos,
  setHashConfigPrecos,
} from '@/features/auth/appHash'
import { useAuth } from '@/features/auth/AuthContext'
import { ConfigPricingSidebar } from '@/features/pricing-config/components/ConfigPricingSidebar'
import type { ConfigTabId } from '@/features/pricing-config/types'
import { PreviewProposalModal } from '@/features/pricing-config/components/PreviewProposalModal'
import { SummaryPanel } from '@/features/pricing-config/components/SummaryPanel'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import {
  buildProposalStateFromTemplate,
  isProposalTemplateId,
} from '@/features/proposal/lib/proposalTemplates'
import { proposalSnapshotToState } from '@/features/proposal/lib/proposalTemplateSnapshot'
import type { Prices } from '@/domain/prices'
import { AppShell } from '@/components/layout/AppShell'
import { Stepper } from '@/components/ui/Stepper'
import { PriceConfiguration } from '@/pages/price-configuration'
import { ProposalTemplates } from '@/pages/proposal-templates'
import { SavedProposals } from '@/pages/saved-proposals'
import { Users } from '@/pages/users'
import { WizardPage } from '@/pages/wizard'
import type { MainAppRoute } from '@/routes/main-app.types'
import { buildProposalHtml } from '@/utils/buildProposalHtml'
import { downloadHtmlDocument, proposalFilename } from '@/utils/downloadHtml'

const STEPPER_STEPS = [
  {
    title: 'Escopo do Monitoramento',
    subtitle: 'Marcas, concorrentes e setor.',
  },
  {
    title: 'Tipos de Monitoramento',
    subtitle: 'Selecione os serviços por escopo.',
  },
  {
    title: 'Serviços Adicionais',
    subtitle: 'Broadcast, relatórios e outros.',
  },
  {
    title: 'Resumo e Proposta',
    subtitle: 'Revise e gere sua proposta.',
  },
]

export function MainAppRoutes() {
  const { user } = useAuth()
  const {
    state,
    dispatch,
    calculationInput,
    calculation,
    loadSavedProposal,
    userProposalTemplates,
    bumpUserTemplateUsage,
  } = useProposal()
  const [route, setRoute] = useState<MainAppRoute>('wizard')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [pricingDraft, setPricingDraft] = useState<Prices | null>(null)
  const [precoBaseDraft, setPrecoBaseDraft] = useState<number | null>(null)
  const [settingsSidebarSection, setSettingsSidebarSection] =
    useState<ConfigTabId>('base')
  const [accessBanner, setAccessBanner] = useState<string | null>(null)

  const navigateMain = useCallback(
    (r: MainAppRoute) => {
      if (r === 'settings' && !user?.isAdmin) {
        setAccessBanner(
          'Você não tem permissão para acessar a configuração de preços.',
        )
        window.setTimeout(() => setAccessBanner(null), 6500)
        return
      }
      if (r === 'users' && !user?.isAdmin) {
        setAccessBanner(
          'Você não tem permissão para acessar o gerenciamento de usuários.',
        )
        window.setTimeout(() => setAccessBanner(null), 6500)
        return
      }
      setAccessBanner(null)
      setRoute(r)
    },
    [user],
  )

  useEffect(() => {
    if (route === 'settings' && user && !user.isAdmin) {
      clearUrlHash()
      setRoute('wizard')
      setAccessBanner(
        'Você não tem permissão para acessar a configuração de preços.',
      )
      window.setTimeout(() => setAccessBanner(null), 6500)
    }
  }, [route, user])

  useEffect(() => {
    if (route === 'users' && user && !user.isAdmin) {
      setRoute('wizard')
      setAccessBanner(
        'Você não tem permissão para acessar o gerenciamento de usuários.',
      )
      window.setTimeout(() => setAccessBanner(null), 6500)
    }
  }, [route, user])

  useEffect(() => {
    if (!readHashConfigPrecos()) return
    if (user?.isAdmin) {
      setRoute('settings')
    } else {
      clearUrlHash()
      setAccessBanner(
        'Você não tem permissão para acessar a configuração de preços.',
      )
      window.setTimeout(() => setAccessBanner(null), 6500)
    }
  }, [user])

  useEffect(() => {
    const onHash = () => {
      if (!readHashConfigPrecos()) return
      if (user?.isAdmin) {
        setRoute('settings')
        return
      }
      clearUrlHash()
      setAccessBanner(
        'Você não tem permissão para acessar a configuração de preços.',
      )
      window.setTimeout(() => setAccessBanner(null), 6500)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [user])

  useEffect(() => {
    if (route === 'settings' && user?.isAdmin) {
      setHashConfigPrecos()
    }
  }, [route, user])

  useEffect(() => {
    if (route !== 'settings' && readHashConfigPrecos()) {
      clearUrlHash()
    }
  }, [route])

  useEffect(() => {
    if (route === 'settings') {
      setPricingDraft(structuredClone(state.prices))
      setPrecoBaseDraft(state.precoBaseMensal)
    } else {
      setPricingDraft(null)
      setPrecoBaseDraft(null)
    }
  }, [route, state.prices, state.precoBaseMensal])

  const html = useMemo(
    () =>
      buildProposalHtml(calculationInput, calculation, {
        meta: state.meta,
        generatedAt: state.lastSavedAt ?? Date.now(),
      }),
    [calculationInput, calculation, state.lastSavedAt, state.meta],
  )

  function handleDownload(filename?: string) {
    downloadHtmlDocument(
      html,
      filename ?? proposalFilename(state.meta.clientName),
    )
  }

  function handleSaveComplete() {
    setRoute('saved')
  }

  const step = state.currentStep

  function handleOpenPreview(content = html) {
    setPreviewHtml(content)
    setPreviewOpen(true)
  }

  function handleNovaProposta() {
    dispatch({ type: 'RESET_PROPOSAL' })
    setRoute('wizard')
  }

  function handleUsarModelo(templateId: string) {
    const seed = {
      precoBaseMensal: state.precoBaseMensal,
      prices: state.prices,
      pricingConfigSavedAt: state.pricingConfigSavedAt,
    }
    if (isProposalTemplateId(templateId)) {
      dispatch({
        type: 'LOAD_PROPOSAL_STATE',
        state: buildProposalStateFromTemplate(templateId, seed),
      })
    } else {
      const record = userProposalTemplates.find((t) => t.id === templateId)
      if (!record) return
      dispatch({
        type: 'LOAD_PROPOSAL_STATE',
        state: proposalSnapshotToState(record.snapshot, seed),
      })
      bumpUserTemplateUsage(templateId)
    }
    setRoute('wizard')
  }

  function handleOpenSavedProposal(proposalId: string) {
    const proposal = loadSavedProposal(proposalId)
    if (!proposal) return

    setRoute('wizard')
  }

  return (
    <div
      className={
        accessBanner ? 'app-root app-root--with-access-banner' : 'app-root'
      }
    >
      {accessBanner ? (
        <div className="app-access-banner" role="alert">
          {accessBanner}
        </div>
      ) : null}
      <AppShell
        stepper={
          route === 'wizard' ? (
            <Stepper steps={STEPPER_STEPS} currentIndex={step} />
          ) : null
        }
        rightAside={
          route === 'wizard' ? (
            <SummaryPanel />
          ) : route === 'settings' ? (
            <ConfigPricingSidebar
              prices={pricingDraft ?? state.prices}
              precoBaseMensal={precoBaseDraft ?? state.precoBaseMensal}
              pricingSavedAt={state.pricingConfigSavedAt}
              focusSection={settingsSidebarSection}
            />
          ) : null
        }
        sidebarActiveRoute={route}
        onSidebarNavigate={navigateMain}
        onNovaProposta={handleNovaProposta}
        onPreviewProposal={() => handleOpenPreview()}
        showSidebarProposalPreview={route === 'wizard'}
      >
        {route === 'settings' ? (
          <PriceConfiguration
            draftPrices={pricingDraft ?? state.prices}
            setDraftPrices={setPricingDraft}
            draftPrecoBaseMensal={precoBaseDraft ?? state.precoBaseMensal}
            setDraftPrecoBaseMensal={setPrecoBaseDraft}
            onActiveTabChange={setSettingsSidebarSection}
          />
        ) : route === 'saved' ? (
          <SavedProposals
            onNovaProposta={handleNovaProposta}
            onOpenProposal={handleOpenSavedProposal}
            onPreviewProposal={handleOpenPreview}
          />
        ) : route === 'templates' ? (
          <ProposalTemplates
            onNovoModelo={handleNovaProposta}
            onUsarModelo={handleUsarModelo}
          />
        ) : route === 'users' ? (
          <Users />
        ) : (
          <WizardPage
            onDownload={handleDownload}
            onSaveComplete={handleSaveComplete}
          />
        )}
      </AppShell>

      <PreviewProposalModal
        open={previewOpen}
        html={previewHtml}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}
