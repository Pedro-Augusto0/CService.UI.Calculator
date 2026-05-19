import { Toggle } from '@/components/ui/Toggle'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { ServiceToggleGrid } from '@/features/proposal/components/ServiceToggleGrid'
import { SECTION_KEYS } from '@/domain/types'
import type { MatterServiceKey } from '@/domain/types'
import { SECTION_LABELS } from '@/domain/prices'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import './TiposMonitoramento.css'

export function TiposMonitoramento() {
  const { state, dispatch } = useProposal()
  const tab = state.activeScopeTab
  const sec = state.sections[tab]
  const avaliacaoSelected = SECTION_KEYS.some(
    (k) => state.sections[k].services.avaliacao,
  )
  const avaliacaoTiers = state.prices.matterServices.avaliacao.tiers

  return (
    <div className="page-etapa tipos-page">
      <Card className="tipos-page__panel">
        <Toggle
          checked={state.applyServicesToAll}
          onChange={(v) =>
            dispatch({ type: 'SET_APPLY_SERVICES_TO_ALL', value: v })
          }
          label="Aplicar serviços a todas as categorias"
          description="Quando ligado, alternar um serviço espelha a mesma seleção em Marcas, Concorrentes e Setor."
        />

        <div className="tipos-page__tabs" role="tablist" aria-label="Escopo">
          {SECTION_KEYS.map((key) => {
            const active = tab === key
            const count = state.sections[key].keywords.length
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`tipos-page__tab ${active ? 'tipos-page__tab--on' : ''}`}
                onClick={() =>
                  dispatch({ type: 'SET_ACTIVE_SCOPE_TAB', section: key })
                }
              >
                <span className="tipos-page__tab-title">{SECTION_LABELS[key]}</span>
                <span className="tipos-page__tab-meta">{count} termos</span>
              </button>
            )
          })}
        </div>

        <div className="tipos-page__services-head">
          <h2 className="tipos-page__services-title">Serviços por matéria</h2>
          <p className="tipos-page__services-sub">
            Selecione os serviços que serão aplicados a este escopo. 
          </p>
        </div>

        <ServiceToggleGrid
          variant="large"
          selected={sec.services}
          onToggle={(service: MatterServiceKey) =>
            dispatch({
              type: 'TOGGLE_SECTION_SERVICE',
              section: tab,
              service,
            })
          }
        />

        {avaliacaoSelected ? (
          <div className="tipos-page__aval">
            <SelectField
              dense
              id="aval-tier"
              label="Faixa da Avaliação (quantidade de campos)"
              hint="Tabelas configuradas pelo administrador."
              value={state.avaliacaoTierId ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_AVALIACAO_TIER',
                  tierId: e.target.value || null,
                })
              }
            >
              <option value="">Selecione uma faixa…</option>
              {avaliacaoTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label} ({tier.fieldCount} campos)
                </option>
              ))}
            </SelectField>
          </div>
        ) : null}
      </Card>

      <div className="tipos-page__info">
        Os serviços marcados se aplicam ao volume estimado deste escopo (
        <strong>{sec.volume} notícias/mês</strong>) e ao volume total. Use o toggle
        Fixo/Variável no Resumo da Proposta para alternar o modo de cobrança ao vivo.
      </div>
    </div>
  )
}
