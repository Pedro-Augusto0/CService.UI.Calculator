import { useMemo, useState } from 'react'
import './App.css'
import { AppShell } from './components/layout/AppShell'
import { PreviewProposalModal } from './components/layout/PreviewProposalModal'
import { PriceSettingsModal } from './components/layout/PriceSettingsModal'
import { Button } from './components/ui/Button'
import { Stepper } from './components/ui/Stepper'
import { Escopo } from './pages/etapa/Escopo'
import { ResumoProposta } from './pages/etapa/ResumoProposta'
import { ServicosAdicionais } from './pages/etapa/ServicosAdicionais'
import { TiposMonitoramento } from './pages/etapa/TiposMonitoramento'
import {
  ProposalProvider,
  useProposal,
} from './proposal/ProposalProvider'
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
  const { state, dispatch, calculationInput, calculation } = useProposal()
  const [priceOpen, setPriceOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const html = useMemo(
    () => buildProposalHtml(calculationInput, calculation),
    [calculationInput, calculation],
  )

  function handleDownload() {
    downloadHtmlDocument(html, proposalFilename())
  }

  const step = state.currentStep

  return (
    <>
      <AppShell
        stepper={<Stepper steps={STEPPER_STEPS} currentIndex={step} />}
        onNovaProposta={() => dispatch({ type: 'RESET_PROPOSAL' })}
        onOpenPrices={() => setPriceOpen(true)}
        onPreview={() => setPreviewOpen(true)}
        onDownload={handleDownload}
      >
        <>
          {step === 0 ? <Escopo /> : null}
          {step === 1 ? <TiposMonitoramento /> : null}
          {step === 2 ? <ServicosAdicionais /> : null}
          {step === 3 ? (
            <ResumoProposta onDownload={handleDownload} />
          ) : null}

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
          ) : (
            <div className="wizard-footer wizard-footer--end">
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch({ type: 'SET_STEP', step: step - 1 })
                }
              >
                Voltar
              </Button>
            </div>
          )}
        </>
      </AppShell>

      <PriceSettingsModal
        open={priceOpen}
        prices={state.prices}
        onClose={() => setPriceOpen(false)}
        onSave={(p) => dispatch({ type: 'SET_PRICES', prices: p })}
      />

      <PreviewProposalModal
        open={previewOpen}
        html={html}
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
