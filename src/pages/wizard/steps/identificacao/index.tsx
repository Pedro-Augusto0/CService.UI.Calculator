import { BriefcaseBusiness, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { FIXED_PROPOSAL_VALIDADE_DIAS } from '@/features/proposal/lib/proposalReducer'
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
              Informe o cliente e um nome para esta proposta. A validade está fixa em{' '}
              {FIXED_PROPOSAL_VALIDADE_DIAS} dias por enquanto. Esses dados aparecem nas propostas
              salvas e no arquivo exportado.
            </p>
          </div>
        </div>
        <div className="escopo-page__meta-grid">
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
        </div>
      </Card>
    </div>
  )
}
