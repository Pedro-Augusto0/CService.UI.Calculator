import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { MainAppRoute } from './components/layout/AppShell'
import { AppShell } from './components/layout/AppShell'
import { ConfigPricingSidebar } from './components/layout/ConfigPricingSidebar'
import { PreviewProposalModal } from './components/layout/PreviewProposalModal'
import { SummaryPanel } from './components/layout/SummaryPanel'
import { Button } from './components/ui/Button'
import { Stepper } from './components/ui/Stepper'
import { Configuracao } from './pages/Configuracao'
import { PropostasSalvas } from './pages/PropostasSalvas'
import { Escopo } from './pages/etapa/Escopo'
import { ResumoProposta } from './pages/etapa/ResumoProposta'
import { ServicosAdicionais } from './pages/etapa/ServicosAdicionais'
import { TiposMonitoramento } from './pages/etapa/TiposMonitoramento'
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

  useEffect(() => {
    if (route === 'settings') {
      setPricingDraft(structuredClone(state.prices))
    } else {
      setPricingDraft(null)
    }
  }, [route, state.prices])

  const html = useMemo(
    () => buildProposalHtml(calculationInput, calculation),
    [calculationInput, calculation],
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
    <>
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
              precoBaseMensal={state.precoBaseMensal}
              pricingSavedAt={state.pricingConfigSavedAt}
            />
          ) : null
        }
        sidebarActiveRoute={route}
        onSidebarNavigate={setRoute}
        onNovaProposta={handleNovaProposta}
        onPreviewProposal={() => handleOpenPreview()}
        showSidebarProposalPreview={route === 'wizard'}
      >
        {route === 'settings' ? (
          <Configuracao
            draftPrices={pricingDraft ?? state.prices}
            setDraftPrices={setPricingDraft}
          />
        ) : route === 'saved' ? (
          <PropostasSalvas
            onNovaProposta={handleNovaProposta}
            onOpenProposal={handleOpenSavedProposal}
            onPreviewProposal={handleOpenPreview}
          />
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
    </>
  )
}

export default function App() {
  return (
    <ProposalProvider>
      <AppContent />
    </ProposalProvider>
  )
}
