import { BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { Escopo } from '@/pages/wizard/steps/escopo'
import { IdentificacaoProposta } from '@/pages/wizard/steps/identificacao'
import { ResumoProposta } from '@/pages/wizard/steps/resumo-proposta'
import { ServicosAdicionais } from '@/pages/wizard/steps/servicos-adicionais'
import { TiposMidia } from '@/pages/wizard/steps/tipos-midia'

interface WizardPageProps {
  onDownload: (filename?: string) => void
  onSaveComplete: () => void
  onOpenSaveTemplate: () => void
}

const LAST_STEP_INDEX = 4

export function WizardPage({
  onDownload,
  onSaveComplete,
  onOpenSaveTemplate,
}: WizardPageProps) {
  const { state, dispatch } = useProposal()
  const step = state.currentStep

  return (
    <div className="wizard-layout">
      <div className="wizard-content">
        {step === 0 ? <IdentificacaoProposta /> : null}
        {step === 1 ? <TiposMidia /> : null}
        {step === 2 ? <Escopo /> : null}
        {step === 3 ? <ServicosAdicionais /> : null}
        {step === 4 ? (
          <ResumoProposta
            onBack={() => dispatch({ type: 'SET_STEP', step: step - 1 })}
            onDownload={onDownload}
            onSaveComplete={onSaveComplete}
            onOpenSaveTemplate={onOpenSaveTemplate}
          />
        ) : null}
      </div>

      {step < LAST_STEP_INDEX ? (
        <div className="wizard-footer">
          <div className="wizard-footer__left">
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => dispatch({ type: 'SET_STEP', step: step - 1 })}
            >
              Voltar
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={onOpenSaveTemplate}
            >
              <BookMarked size={16} strokeWidth={2} aria-hidden />
              Salvar como modelo
            </Button>
          </div>
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
