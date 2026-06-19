import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearUrlHash,
  readHashConfigPrecos,
  setHashConfigPrecos,
} from '@/features/auth/appHash'
import { useAuth } from '@/features/auth/AuthContext'
import { PreviewProposalModal } from '@/features/pricing-config/components/PreviewProposalModal'
import { SaveProposalTemplateModal } from '@/features/proposal/components/SaveProposalTemplateModal'
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
import { Clients } from '@/pages/clients'
import { ProposalTemplates } from '@/pages/proposal-templates'
import { SavedProposals } from '@/pages/saved-proposals'
import { Users } from '@/pages/users'
import { WizardPage } from '@/pages/wizard'
import type { MainAppRoute } from '@/routes/main-app.types'
import { buildProposalHtml } from '@/utils/buildProposalHtml'
import { downloadHtmlDocument, proposalFilename } from '@/utils/downloadHtml'

const STEPPER_STEPS = [
  {
    title: 'Identificação',
    subtitle: 'Cliente e nome da proposta.',
  },
  {
    title: 'Monitoramentos',
    subtitle: 'Canais do monitoramento.',
  },
  {
    title: 'Escopo',
    subtitle: 'Próprio, concorrentes e setor.',
  },
  {
    title: 'Serviços adicionais',
    subtitle: 'Relatórios, newsletter e mais.',
  },
  {
    title: 'Resumo e proposta',
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
    saveCurrentProposal,
    saveCurrentAsUserTemplate,
  } = useProposal()
  const [route, setRoute] = useState<MainAppRoute>('wizard')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [pricingDraft, setPricingDraft] = useState<Prices | null>(null)
  const [accessBanner, setAccessBanner] = useState<string | null>(null)

  const navigateMain = useCallback(
    (r: MainAppRoute) => {
      if (r === 'settings' && !user?.isMasterAdmin) {
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
      if (r === 'templates') return
      setAccessBanner(null)
      setRoute(r)
    },
    [user],
  )

  useEffect(() => {
    if (route === 'settings' && user && !user.isMasterAdmin) {
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
    if (route === 'templates') setRoute('wizard')
  }, [route])

  useEffect(() => {
    if (!readHashConfigPrecos()) return
    if (user?.isMasterAdmin) {
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
      if (user?.isMasterAdmin) {
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
    if (route === 'settings' && user?.isMasterAdmin) {
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
    } else {
      setPricingDraft(null)
    }
  }, [route, state.prices])

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

  async function handleOpenSavedProposal(proposalId: string) {
    const proposal = await Promise.resolve(loadSavedProposal(proposalId))
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
            <Stepper
              steps={STEPPER_STEPS}
              currentIndex={step}
              onStepChange={(i) => dispatch({ type: 'SET_STEP', step: i })}
            />
          ) : null
        }
        rightAside={
          route === 'wizard' ? (
            <SummaryPanel
              resumoStepActions={
                step === 4
                  ? {
                      onSaveProposal: async () => {
                        await Promise.resolve(saveCurrentProposal())
                        handleSaveComplete()
                      },
                      onDownload: () =>
                        handleDownload(proposalFilename(state.meta.clientName)),
                      onOpenSaveTemplate: () => setSaveTemplateOpen(true),
                      saveProposalLabel: state.savedProposalId
                        ? 'Atualizar proposta'
                        : 'Salvar proposta',
                    }
                  : undefined
              }
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
          />
        ) : route === 'saved' ? (
          <SavedProposals
            onNovaProposta={handleNovaProposta}
            onOpenProposal={handleOpenSavedProposal}
            onPreviewProposal={handleOpenPreview}
          />
        ) : route === 'clients' ? (
          <Clients />
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
            onOpenSaveTemplate={() => setSaveTemplateOpen(true)}
          />
        )}
      </AppShell>

      <PreviewProposalModal
        open={previewOpen}
        html={previewHtml}
        onClose={() => setPreviewOpen(false)}
      />

      <SaveProposalTemplateModal
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        onSave={(name, description) => {
          saveCurrentAsUserTemplate(name, description)
        }}
      />
    </div>
  )
}
