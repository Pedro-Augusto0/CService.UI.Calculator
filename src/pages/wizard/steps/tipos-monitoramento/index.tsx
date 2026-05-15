import { Toggle } from '@/components/ui/Toggle'
import { Card } from '@/components/ui/Card'
import { ServiceToggleGrid } from '@/features/proposal/components/ServiceToggleGrid'
import { SECTION_KEYS } from '@/domain/types'
import { SECTION_LABELS } from '@/domain/prices'
import type { MonitoringServiceKey } from '@/domain/types'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import './TiposMonitoramento.css'

export function TiposMonitoramento() {
  const { state, dispatch } = useProposal()
  const tab = state.activeScopeTab
  const sec = state.sections[tab]

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
          <h2 className="tipos-page__services-title">Serviços disponíveis</h2>
          <p className="tipos-page__services-sub">
            Selecione os formatos de entrega e análise aplicados ao volume deste
            escopo.
          </p>
        </div>

        <ServiceToggleGrid
          variant="large"
          selected={sec.services}
          onToggle={(service: MonitoringServiceKey) =>
            dispatch({
              type: 'TOGGLE_SECTION_SERVICE',
              section: tab,
              service,
            })
          }
        />
      </Card>

      <div className="tipos-page__info">
        Os serviços marcados multiplicam o volume estimado deste escopo (
        <strong>{sec.volume} notícias/mês</strong>) pelos respectivos preços
        unitários configurados.
      </div>
    </div>
  )
}
