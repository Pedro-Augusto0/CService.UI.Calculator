import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  clearUrlHash,
  readHashConfigPrecos,
  setHashConfigPrecos,
} from './auth/appHash'
import { useAuth } from './auth/AuthContext'
import type { MainAppRoute } from './components/layout/AppShell'
import { AppShell } from './components/layout/AppShell'
import { ConfigPricingSidebar } from './components/layout/ConfigPricingSidebar'
import { PreviewProposalModal } from './components/layout/PreviewProposalModal'
import { SummaryPanel } from './components/layout/SummaryPanel'
import { Button } from './components/ui/Button'
import { Stepper } from './components/ui/Stepper'
import { Configuracao, type ConfigTabId } from './pages/Configuracao'
import { PropostasSalvas } from './pages/PropostasSalvas'
import { Usuarios } from './pages/Usuarios'
import { Escopo } from './pages/etapa/Escopo'
import { ResumoProposta } from './pages/etapa/ResumoProposta'
import { ServicosAdicionais } from './pages/etapa/ServicosAdicionais'
import { TiposMonitoramento } from './pages/etapa/TiposMonitoramento'
import { AuthPages } from './pages/auth/AuthPages'
import {
  ProposalProvider,
  useProposal,
} from './proposal/ProposalProvider'
import type { Prices } from './domain/prices'
import { buildProposalHtml } from './utils/buildProposalHtml'
import { downloadHtmlDocument, proposalFilename } from './utils/downloadHtml'

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

function AppContent() {
  const { user } = useAuth()
  const {
    state,
    dispatch,
    calculationInput,
    calculation,
    loadSavedProposal,
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
    downloadHtmlDocument(html, filename ?? proposalFilename(state.meta.clientName))
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

  function handleOpenSavedProposal(proposalId: string) {
    const proposal = loadSavedProposal(proposalId)
    if (!proposal) return

    setRoute('wizard')
  }

  return (
    <div
      className={
        accessBanner
          ? 'app-root app-root--with-access-banner'
          : 'app-root'
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
          <Configuracao
            draftPrices={pricingDraft ?? state.prices}
            setDraftPrices={setPricingDraft}
            draftPrecoBaseMensal={precoBaseDraft ?? state.precoBaseMensal}
            setDraftPrecoBaseMensal={setPrecoBaseDraft}
            onActiveTabChange={setSettingsSidebarSection}
          />
        ) : route === 'saved' ? (
          <PropostasSalvas
            onNovaProposta={handleNovaProposta}
            onOpenProposal={handleOpenSavedProposal}
            onPreviewProposal={handleOpenPreview}
          />
        ) : route === 'users' ? (
          <Usuarios />
        ) : (
          <div className="wizard-layout">
            <div className="wizard-content">
              {step === 0 ? <Escopo /> : null}
              {step === 1 ? <TiposMonitoramento /> : null}
              {step === 2 ? <ServicosAdicionais /> : null}
              {step === 3 ? (
                <ResumoProposta
                  onBack={() =>
                    dispatch({ type: 'SET_STEP', step: step - 1 })
                  }
                  onDownload={handleDownload}
                  onSaveComplete={handleSaveComplete}
                />
              ) : null}
            </div>

            {step < 3 ? (
              <div className="wizard-footer">
                <Button
                  variant="secondary"
                  disabled={step === 0}
                  onClick={() =>
                    dispatch({ type: 'SET_STEP', step: step - 1 })
                  }
                >
                  Voltar
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    dispatch({ type: 'SET_STEP', step: step + 1 })
                  }
                >
                  Continuar
                </Button>
              </div>
            ) : null}
          </div>
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

export default function App() {
  const { user } = useAuth()
  if (!user) {
    return <AuthPages />
  }
  return (
    <ProposalProvider>
      <AppContent />
    </ProposalProvider>
  )
}
