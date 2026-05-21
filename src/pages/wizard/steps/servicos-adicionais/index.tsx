import {
  BadgePercent,
  Bell,
  ChevronDown,
  Cpu,
  FileBarChart,
  Mail,
  Send,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { Toggle } from '@/components/ui/Toggle'
import { REPORT_FREQUENCIES, type ReportFrequency } from '@/domain/types'
import { REPORT_FREQUENCY_LABELS } from '@/domain/prices'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import './ServicosAdicionais.css'

type SectionKey = 'reports' | 'distribution' | 'others' | 'modifiers'

interface AccordionSectionProps {
  open: boolean
  onToggle: () => void
  icon: LucideIcon
  title: string
  children: ReactNode
}

function AccordionSection({
  open,
  onToggle,
  icon: Icon,
  title,
  children,
}: AccordionSectionProps) {
  return (
    <Card
      className={`add-page__accordion ${open ? 'add-page__accordion--open' : ''}`}
    >
      <button
        type="button"
        className="add-page__accordion-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="add-page__accordion-title-wrap">
          <span className="add-page__accordion-icon" aria-hidden>
            <Icon size={16} strokeWidth={2} />
          </span>
          <span className="add-page__accordion-title">{title}</span>
        </span>
        <ChevronDown
          size={20}
          className={`add-page__accordion-chevron ${open ? 'add-page__accordion-chevron--up' : ''}`}
        />
      </button>
      {open ? <div className="add-page__accordion-body">{children}</div> : null}
    </Card>
  )
}

export function ServicosAdicionais() {
  const { state, dispatch } = useProposal()
  const a = state.additionals
  const r = state.reports
  const prices = state.prices

  const [openSection, setOpenSection] = useState<SectionKey | null>('reports')
  function toggleSection(s: SectionKey) {
    setOpenSection((prev) => (prev === s ? null : s))
  }

  return (
    <div className="page-etapa add-page">
      <AccordionSection
        open={openSection === 'reports'}
        onToggle={() => toggleSection('reports')}
        icon={FileBarChart}
        title="Relatórios e BI"
      >
        <div className="add-page__grid">
          <Card className="add-page__bc">
            <Toggle
              checked={r.executivoEnabled}
              onChange={(v) =>
                dispatch({ type: 'TOGGLE_REPORT_EXECUTIVO', enabled: v })
              }
              label="Relatório Executivo CService"
              description="Apresentação em PowerPoint."
            />
            <SelectField
              dense
              id="rep-exec-freq"
              label="Frequência"
              disabled={!r.executivoEnabled}
              value={r.executivoFreq ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_REPORT_EXECUTIVO_FREQ',
                  freq: (e.target.value as ReportFrequency) || null,
                })
              }
            >
              <option value="">Selecione…</option>
              {REPORT_FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {REPORT_FREQUENCY_LABELS[f]}
                </option>
              ))}
            </SelectField>
          </Card>

          <Card className="add-page__bc">
            <Toggle
              checked={r.estrategicoEnabled}
              onChange={(v) =>
                dispatch({ type: 'TOGGLE_REPORT_ESTRATEGICO', enabled: v })
              }
              label="Relatório Estratégico de Mídia"
              description="Entrega em formato HTML."
            />
            <SelectField
              dense
              id="rep-estr-freq"
              label="Frequência"
              disabled={!r.estrategicoEnabled}
              value={r.estrategicoFreq ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_REPORT_ESTRATEGICO_FREQ',
                  freq: (e.target.value as ReportFrequency) || null,
                })
              }
            >
              <option value="">Selecione…</option>
              {REPORT_FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {REPORT_FREQUENCY_LABELS[f]}
                </option>
              ))}
            </SelectField>
          </Card>

          <Card className="add-page__bc">
            <Toggle
              checked={r.biEnabled}
              onChange={(v) => dispatch({ type: 'TOGGLE_BI', enabled: v })}
              label="CService BI"
              description="Setup único + manutenção mensal."
            />
          </Card>
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === 'distribution'}
        onToggle={() => toggleSection('distribution')}
        icon={Send}
        title="Newsletter e distribuição"
      >
        <div className="add-page__distribution">
          <div className="add-page__distribution-email-panel">
            <div className="add-page__distribution-col add-page__distribution-col--email">
              <div className="add-page__distribution-block-head">
                <span
                  className="add-page__distribution-avatar add-page__distribution-avatar--mail"
                  aria-hidden
                >
                  <Mail size={18} strokeWidth={2} />
                </span>
                <div className="add-page__distribution-block-titles">
                  <span className="add-page__distribution-block-title">
                    Newsletter por E-mail
                  </span>
                  <p className="add-page__distribution-block-desc">
                    Envio padrão de newsletter por e-mail.
                  </p>
                </div>
              </div>
              <TextField
                dense
                id="news-extra"
                label="Newsletters adicionais (qtd. envios extras)"
                type="number"
                min={0}
                step={1}
                placeholder="0"
                value={a.newsletterExtraEnvios || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_NEWSLETTER_EXTRA_ENVIOS',
                    value: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <div className="add-page__distribution-divider" aria-hidden />
            <div className="add-page__distribution-col add-page__distribution-col--recipients">
              <Toggle
                checked={a.destinatariosExtrasEnabled}
                onChange={(v) =>
                  dispatch({ type: 'TOGGLE_DESTINATARIOS_EXTRAS', enabled: v })
                }
                label="Destinatários adicionais"
                description="Faixa fixa de destinatários extras."
              />
              <SelectField
                dense
                id="de-tier"
                label="Faixa"
                disabled={!a.destinatariosExtrasEnabled}
                value={a.destinatariosExtrasTierId ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_DESTINATARIOS_EXTRAS_TIER',
                    tierId: e.target.value || null,
                  })
                }
              >
                <option value="">Selecione…</option>
                {prices.additionals.destinatariosExtras.tiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          <div className="add-page__distribution-wa-panel">
            <span
              className="add-page__distribution-avatar add-page__distribution-avatar--wa"
              aria-hidden
            >
              <WhatsAppIcon size={18} />
            </span>
            <div className="add-page__distribution-wa-controls">
              <Toggle
                checked={a.newsletterWhatsApp}
                onChange={(v) =>
                  dispatch({
                    type: 'SET_ADDITIONALS',
                    patch: { newsletterWhatsApp: v },
                  })
                }
                label="Envio de Newsletter via WhatsApp"
                description="Cobrança fixa mensal."
              />
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === 'others'}
        onToggle={() => toggleSection('others')}
        icon={Cpu}
        title="Outros adicionais"
      >
        <div className="add-page__other">
          <Toggle
            checked={a.alertasWebRealtime}
            onChange={(v) =>
              dispatch({ type: 'SET_ADDITIONALS', patch: { alertasWebRealtime: v } })
            }
            label="Alertas Web em Tempo Real"
            description="Cobrança fixa mensal."
          />
          <Toggle
            checked={a.apiCService}
            onChange={(v) =>
              dispatch({ type: 'SET_ADDITIONALS', patch: { apiCService: v } })
            }
            label="Integração via API CService"
            description="Cobrança fixa mensal."
          />
          <Toggle
            checked={a.curadoriaAprovacaoManual}
            onChange={(v) =>
              dispatch({
                type: 'SET_ADDITIONALS',
                patch: { curadoriaAprovacaoManual: v },
              })
            }
            label="Curadoria e Aprovação Manual"
            description="Cobrança fixa mensal."
          />
        </div>
      </AccordionSection>

      <AccordionSection
        open={openSection === 'modifiers'}
        onToggle={() => toggleSection('modifiers')}
        icon={BadgePercent}
        title="Modificadores percentuais"
      >
        <div className="add-page__other">
          <Toggle
            checked={a.plantaoFimSemana}
            onChange={(v) =>
              dispatch({ type: 'SET_ADDITIONALS', patch: { plantaoFimSemana: v } })
            }
            label="Plantão Finais de Semana e Feriados"
            description={`+${prices.additionals.plantaoPercent}% sobre o subtotal.`}
          />
          <Toggle
            checked={a.aprovacaoAutomatica}
            onChange={(v) =>
              dispatch({ type: 'SET_ADDITIONALS', patch: { aprovacaoAutomatica: v } })
            }
            label="Aprovação / Envio Automático"
            description={`Desconto de ${prices.additionals.aprovacaoAutomaticaPercent}% aplicado após o plantão.`}
          />
        </div>
      </AccordionSection>

      <p className="add-page__hint">
        <Bell size={14} strokeWidth={2} aria-hidden /> O modo de cobrança (Fixo
        ou Variável) dos Serviços por Matéria é escolhido no próximo passo
        (Resumo da Proposta).
      </p>
    </div>
  )
}
