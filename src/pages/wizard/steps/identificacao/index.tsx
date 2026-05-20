import { BriefcaseBusiness, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import '../escopo/Escopo.css'

export function IdentificacaoProposta() {
  const { state, dispatch } = useProposal()

  return (
    <div className="page-etapa escopo-page">
      <Card className="escopo-page__meta-card">
        <div className="escopo-page__meta-head">
          <span className="escopo-page__meta-icon" aria-hidden>
            <FileText size={18} strokeWidth={2} />
          </span>
          <div>
            <h2 className="escopo-page__meta-title">Identificação da proposta</h2>
            <p className="escopo-page__meta-text">
              Informe o cliente, um nome para esta proposta e por quanto tempo ela permanece
              válida. Esses dados aparecem nas propostas salvas e no arquivo exportado.
            </p>
          </div>
        </div>
        <div className="escopo-page__meta-grid escopo-page__meta-grid--with-validade">
          <TextField
            label="Cliente"
            placeholder="Ex.: Nome da empresa"
            value={state.meta.clientName}
            labelIcon={<BriefcaseBusiness size={14} strokeWidth={2} aria-hidden />}
            onChange={(event) =>
              dispatch({
                type: 'SET_PROPOSAL_META',
                patch: { clientName: event.target.value },
              })
            }
          />
          <TextField
            label="Nome da proposta"
            placeholder="Ex.: Monitoramento institucional 2026"
            value={state.meta.proposalName}
            labelIcon={<FileText size={14} strokeWidth={2} aria-hidden />}
            onChange={(event) =>
              dispatch({
                type: 'SET_PROPOSAL_META',
                patch: { proposalName: event.target.value },
              })
            }
          />
          <SelectField
            id="wizard-validade-dias"
            label="Validade da proposta"
            value={String(state.validadeDias)}
            onChange={(e) =>
              dispatch({
                type: 'SET_VALIDADE_DIAS',
                dias: Number.parseInt(e.target.value, 10) || 0,
              })
            }
          >
            {state.prices.validadeOptions.map((dias) => (
              <option key={dias} value={dias}>
                {dias} dia{dias === 1 ? '' : 's'}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>
    </div>
  )
}
