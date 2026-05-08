import { Card } from '../../components/ui/Card'
import { SelectField } from '../../components/ui/SelectField'
import { TextField } from '../../components/ui/TextField'
import { Toggle } from '../../components/ui/Toggle'
import { OperationalParams } from '../../components/proposal/OperationalParams'
import { useProposal } from '../../proposal/ProposalProvider'
import './ServicosAdicionais.css'

export function ServicosAdicionais() {
  const { state, dispatch } = useProposal()
  const b = state.broadcast
  const a = state.additionals
  const op = state.operational

  return (
    <div className="page-etapa add-page">
      <div className="page-etapa__intro">
        <h1 className="page-etapa__title">Serviços adicionais</h1>
        <p className="page-etapa__lead">
          Broadcast fixo, opcionais do contrato e parâmetros de distribuição.
        </p>
      </div>

      <Card className="add-page__card">
        <TextField
          dense
          id="pbm"
          className="ui-field--inline-max"
          label="Preço base mensal (fixo recorrente)"
          hint="Somado ao final, depois dos modificadores percentuais."
          type="number"
          min={0}
          step={1}
          value={state.precoBaseMensal || ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_PRECO_BASE_MENSAL',
              value: Number.parseFloat(e.target.value) || 0,
            })
          }
        />
      </Card>

      <section className="add-page__section-title">Broadcast</section>

      <div className="add-page__grid">
        <Card className="add-page__bc">
          <Toggle
            checked={b.tvEnabled}
            onChange={(v) =>
              dispatch({
                type: 'SET_BROADCAST',
                patch: {
                  tvEnabled: v,
                  tvRegion: v ? b.tvRegion : '',
                },
              })
            }
            label="TV"
            description="Cobrança fixa regional."
          />
          <SelectField
            dense
            id="tv-reg"
            label="Região"
            disabled={!b.tvEnabled}
            value={b.tvRegion}
            onChange={(e) =>
              dispatch({
                type: 'SET_BROADCAST',
                patch: {
                  tvRegion: e.target.value as typeof b.tvRegion,
                },
              })
            }
          >
            <option value="">Selecione…</option>
            <option value="sp_rj">SP + RJ</option>
            <option value="nacional">Nacional</option>
          </SelectField>
        </Card>

        <Card className="add-page__bc">
          <Toggle
            checked={b.radioEnabled}
            onChange={(v) =>
              dispatch({
                type: 'SET_BROADCAST',
                patch: {
                  radioEnabled: v,
                  radioRegion: v ? b.radioRegion : '',
                },
              })
            }
            label="Rádio"
            description="Cobrança fixa regional."
          />
          <SelectField
            dense
            id="radio-reg"
            label="Região"
            disabled={!b.radioEnabled}
            value={b.radioRegion}
            onChange={(e) =>
              dispatch({
                type: 'SET_BROADCAST',
                patch: {
                  radioRegion: e.target.value as typeof b.radioRegion,
                },
              })
            }
          >
            <option value="">Selecione…</option>
            <option value="sp_rj">SP + RJ</option>
            <option value="nacional">Nacional</option>
          </SelectField>
        </Card>
      </div>

      <Card className="add-page__card add-page__rel">
        <Toggle
          checked={b.relatorioEnabled}
          onChange={(v) =>
            dispatch({
              type: 'SET_BROADCAST',
              patch: {
                relatorioEnabled: v,
                relatorioFreq: v ? b.relatorioFreq : '',
              },
            })
          }
          label="Relatório analítico"
          description="Frequência contratada, valor fixo."
        />
        <SelectField
          dense
          id="rel-freq"
          label="Frequência"
          disabled={!b.relatorioEnabled}
          value={b.relatorioFreq}
          onChange={(e) =>
            dispatch({
              type: 'SET_BROADCAST',
              patch: {
                relatorioFreq: e.target.value as typeof b.relatorioFreq,
              },
            })
          }
        >
          <option value="">Selecione…</option>
          <option value="mensal">Mensal</option>
          <option value="semanal">Semanal</option>
        </SelectField>
      </Card>

      <section className="add-page__section-title">Outros serviços</section>

      <Card className="add-page__card add-page__other">
        <Toggle
          checked={a.midiasSociais}
          onChange={(v) =>
            dispatch({ type: 'SET_ADDITIONALS', patch: { midiasSociais: v } })
          }
          label="Mídias Sociais"
          description="Franquia por posts/mês; excedente em blocos."
        />
        <Toggle
          checked={a.alertasWeb}
          onChange={(v) =>
            dispatch({ type: 'SET_ADDITIONALS', patch: { alertasWeb: v } })
          }
          label="Alertas de WebSites"
          description="Envios extras geram acréscimo."
        />
        <Toggle
          checked={a.api}
          onChange={(v) =>
            dispatch({ type: 'SET_ADDITIONALS', patch: { api: v } })
          }
          label="Acesso API"
          description="Valor fixo mensal."
        />
        <Toggle
          checked={a.stories}
          onChange={(v) =>
            dispatch({ type: 'SET_ADDITIONALS', patch: { stories: v } })
          }
          label="Stories"
          description="Pacote fixo."
        />
        <Toggle
          checked={a.destaques}
          onChange={(v) =>
            dispatch({ type: 'SET_ADDITIONALS', patch: { destaques: v } })
          }
          label="Destaques da Semana"
          description="Curadoria semanal — fixo."
        />
      </Card>

      <OperationalParams
        enviosDiarios={op.enviosDiarios}
        numDestinatarios={op.numDestinatarios}
        envioFeriadosFds={op.envioFeriadosFds}
        aprovacaoAutomatica={op.aprovacaoAutomatica}
        onEnviosDiarios={(n) =>
          dispatch({ type: 'SET_OPERATIONAL', patch: { enviosDiarios: n } })
        }
        onNumDestinatarios={(n) =>
          dispatch({ type: 'SET_OPERATIONAL', patch: { numDestinatarios: n } })
        }
        onEnvioFeriadosFds={(v) =>
          dispatch({ type: 'SET_OPERATIONAL', patch: { envioFeriadosFds: v } })
        }
        onAprovacaoAutomatica={(v) =>
          dispatch({
            type: 'SET_OPERATIONAL',
            patch: { aprovacaoAutomatica: v },
          })
        }
      />
    </div>
  )
}
