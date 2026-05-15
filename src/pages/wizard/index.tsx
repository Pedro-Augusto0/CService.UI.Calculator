import { Button } from '@/components/ui/Button'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { Escopo } from '@/pages/wizard/steps/escopo'
import { ResumoProposta } from '@/pages/wizard/steps/resumo-proposta'
import { ServicosAdicionais } from '@/pages/wizard/steps/servicos-adicionais'
import { TiposMonitoramento } from '@/pages/wizard/steps/tipos-monitoramento'

interface WizardPageProps {
  onDownload: (filename?: string) => void
  onSaveComplete: () => void
}

export function WizardPage({ onDownload, onSaveComplete }: WizardPageProps) {
  const { state, dispatch } = useProposal()
  const step = state.currentStep

  return (
    <div className="wizard-layout">
      <div className="wizard-content">
        {step === 0 ? <Escopo /> : null}
        {step === 1 ? <TiposMonitoramento /> : null}
        {step === 2 ? <ServicosAdicionais /> : null}
        {step === 3 ? (
          <ResumoProposta
            onBack={() => dispatch({ type: 'SET_STEP', step: step - 1 })}
            onDownload={onDownload}
            onSaveComplete={onSaveComplete}
          />
        ) : null}
      </div>

      {step < 3 ? (
        <div className="wizard-footer">
          <Button
            variant="secondary"
            disabled={step === 0}
            onClick={() => dispatch({ type: 'SET_STEP', step: step - 1 })}
          >
            Voltar
          </Button>
          <Button
            variant="primary"
            onClick={() => dispatch({ type: 'SET_STEP', step: step + 1 })}
          >
            Continuar
          </Button>
        </div>
      ) : null}
    </div>
  )
}
