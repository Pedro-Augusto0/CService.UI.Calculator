import { BriefcaseBusiness, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { ClientSearchSelect } from '@/features/clients/components/ClientSearchSelect'
import { useApi } from '@/features/api/config'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { FIXED_PROPOSAL_VALIDITY_DAYS } from '@/features/proposal/lib/proposalReducer'
import '../escopo/Escopo.css'

export function IdentificacaoProposta() {
  const { state, dispatch } = useProposal()
  const apiEnabled = useApi()

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
              Selecione o cliente cadastrado e informe um nome para esta proposta. Se não
              encontrar na busca, crie o cliente direto na lista. A validade está fixa em{' '}
              {FIXED_PROPOSAL_VALIDITY_DAYS} dias por enquanto.
            </p>
          </div>
        </div>
        <div className="escopo-page__meta-grid">
          {apiEnabled ? (
            <ClientSearchSelect
              label="Cliente"
              labelIcon={<BriefcaseBusiness size={14} strokeWidth={2} aria-hidden />}
              placeholder="Buscar ou selecionar cliente…"
              value={{
                clientId: state.meta.clientId,
                clientName: state.meta.clientName,
              }}
              onChange={(next) =>
                dispatch({
                  type: 'SET_PROPOSAL_META',
                  patch: {
                    clientId: next.clientId,
                    clientName: next.clientName,
                  },
                })
              }
            />
          ) : (
            <TextField
              label="Cliente"
              placeholder="Ex.: Nome da empresa"
              value={state.meta.clientName}
              labelIcon={<BriefcaseBusiness size={14} strokeWidth={2} aria-hidden />}
              onChange={(event) =>
                dispatch({
                  type: 'SET_PROPOSAL_META',
                  patch: { clientName: event.target.value, clientId: null },
                })
              }
            />
          )}
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
