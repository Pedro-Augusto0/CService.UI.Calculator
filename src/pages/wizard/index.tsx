import { useState } from 'react'
import { BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SaveProposalTemplateModal } from '@/features/proposal/components/SaveProposalTemplateModal'
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
  const { state, dispatch, saveCurrentAsUserTemplate } = useProposal()
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
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
            onOpenSaveTemplate={() => setSaveTemplateOpen(true)}
          />
        ) : null}
      </div>

      {step < 3 ? (
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
              onClick={() => setSaveTemplateOpen(true)}
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
