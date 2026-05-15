import {
  ChevronDown,
  FileBarChart,
  RadioTower,
  Settings2,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { Toggle } from '@/components/ui/Toggle'
import { OperationalParams } from '@/features/proposal/components/OperationalParams'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import './ServicosAdicionais.css'

export function ServicosAdicionais() {
  const { state, dispatch } = useProposal()
  const b = state.broadcast
  const a = state.additionals
  const op = state.operational
  const [openSection, setOpenSection] = useState<
    'broadcast' | 'relatorio' | 'outros' | 'operacional' | null
  >('broadcast')

  function toggleSection(
    section: 'broadcast' | 'relatorio' | 'outros' | 'operacional',
  ) {
    setOpenSection((current) => (current === section ? null : section))
  }

  return (
    <div className="page-etapa add-page">
      <Card
        className={`add-page__accordion ${openSection === 'broadcast' ? 'add-page__accordion--open' : ''}`}
      >
        <button
          type="button"
          className="add-page__accordion-head"
          onClick={() => toggleSection('broadcast')}
          aria-expanded={openSection === 'broadcast'}
        >
          <span className="add-page__accordion-title-wrap">
            <span className="add-page__accordion-icon" aria-hidden>
              <RadioTower size={16} strokeWidth={2} />
            </span>
            <span className="add-page__accordion-title">Broadcast</span>
          </span>
          <ChevronDown
            size={20}
            className={`add-page__accordion-chevron ${openSection === 'broadcast' ? 'add-page__accordion-chevron--up' : ''}`}
          />
        </button>
        {openSection === 'broadcast' ? (
          <div className="add-page__accordion-body">
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
          </div>
        ) : null}
      </Card>

      <Card
        className={`add-page__accordion ${openSection === 'relatorio' ? 'add-page__accordion--open' : ''}`}
      >
        <button
          type="button"
          className="add-page__accordion-head"
          onClick={() => toggleSection('relatorio')}
          aria-expanded={openSection === 'relatorio'}
        >
          <span className="add-page__accordion-title-wrap">
            <span className="add-page__accordion-icon" aria-hidden>
              <FileBarChart size={16} strokeWidth={2} />
            </span>
            <span className="add-page__accordion-title">Relatório Analítico</span>
          </span>
          <ChevronDown
            size={20}
            className={`add-page__accordion-chevron ${openSection === 'relatorio' ? 'add-page__accordion-chevron--up' : ''}`}
          />
        </button>
        {openSection === 'relatorio' ? (
          <div className="add-page__accordion-body">
            <div className="add-page__rel">
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
            </div>
          </div>
        ) : null}
      </Card>

      <Card
        className={`add-page__accordion ${openSection === 'outros' ? 'add-page__accordion--open' : ''}`}
      >
        <button
          type="button"
          className="add-page__accordion-head"
          onClick={() => toggleSection('outros')}
          aria-expanded={openSection === 'outros'}
        >
          <span className="add-page__accordion-title-wrap">
            <span className="add-page__accordion-icon" aria-hidden>
              <Sparkles size={16} strokeWidth={2} />
            </span>
            <span className="add-page__accordion-title">Outros Serviços</span>
          </span>
          <ChevronDown
            size={20}
            className={`add-page__accordion-chevron ${openSection === 'outros' ? 'add-page__accordion-chevron--up' : ''}`}
          />
        </button>
        {openSection === 'outros' ? (
          <div className="add-page__accordion-body">
            <div className="add-page__other">
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
                description="Curadoria semanal - fixo."
              />
            </div>
          </div>
        ) : null}
      </Card>

      <Card
        className={`add-page__accordion ${openSection === 'operacional' ? 'add-page__accordion--open' : ''}`}
      >
        <button
          type="button"
          className="add-page__accordion-head"
          onClick={() => toggleSection('operacional')}
          aria-expanded={openSection === 'operacional'}
        >
          <span className="add-page__accordion-title-wrap">
            <span className="add-page__accordion-icon" aria-hidden>
              <Settings2 size={16} strokeWidth={2} />
            </span>
            <span className="add-page__accordion-title">Parâmetros Operacionais</span>
          </span>
          <ChevronDown
            size={20}
            className={`add-page__accordion-chevron ${openSection === 'operacional' ? 'add-page__accordion-chevron--up' : ''}`}
          />
        </button>
        {openSection === 'operacional' ? (
          <div className="add-page__accordion-body">
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
        ) : null}
      </Card>
    </div>
  )
}
