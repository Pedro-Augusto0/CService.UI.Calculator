import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Building2,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardCheck,
  Tag,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { FieldGroup, TextField } from '@/components/ui/TextField'
import { TagInput } from '@/components/ui/TagInput'
import { SECTION_KEYS, type MatterServiceKey, type SectionKey } from '@/domain/types'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { ServiceToggleGrid } from '@/features/proposal/components/ServiceToggleGrid'
import './Escopo.css'

const META: Record<
  SectionKey,
  { title: string; subtitle: string; icon: ReactNode }
> = {
  brands: {
    title: 'Próprio',
    subtitle: 'Marcas próprias e derivados.',
    icon: <Tag size={20} strokeWidth={2} />,
  },
  competitors: {
    title: 'Concorrentes',
    subtitle: 'Concorrentes diretos ou indiretos.',
    icon: <Users size={20} strokeWidth={2} />,
  },
  sector: {
    title: 'Setor',
    subtitle: 'Termos de setor / macroeconomia.',
    icon: <Building2 size={20} strokeWidth={2} />,
  },
}

export function Escopo() {
  const { state, dispatch } = useProposal()
  const [openSection, setOpenSection] = useState<SectionKey | null>(SECTION_KEYS[0])

  const assessmentTiers = state.prices.matterServices.assessment.tiers
  const anyAvaliacaoOn = SECTION_KEYS.some(
    (k) => state.sections[k].services.assessment,
  )
  const avalTierNeedsChoice =
    anyAvaliacaoOn && assessmentTiers.length > 0 && !state.assessmentTierId

  return (
    <div className="page-etapa escopo-page">
      <Card className="escopo-page__meta-card">
        <div className="escopo-page__meta-head">
          <span className="escopo-page__meta-icon" aria-hidden>
            <BriefcaseBusiness size={18} strokeWidth={2} />
          </span>
          <div>
            <h2 className="escopo-page__meta-title">Escopo do monitoramento</h2>
          <p className="escopo-page__meta-text">
            Selecione os escopos de monitoramento para esta proposta.
          </p>
          </div>
        </div>
      </Card>

      {anyAvaliacaoOn && assessmentTiers.length > 0 ? (
        <Card
          padded={false}
          className={[
            'escopo-page__aval-card',
            avalTierNeedsChoice ? 'escopo-page__aval-card--pending' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="escopo-page__aval-inner">
            <span className="escopo-page__aval-icon" aria-hidden>
              <ClipboardCheck size={18} strokeWidth={2} />
            </span>
            <div className="escopo-page__aval-main">
              <div className="escopo-page__aval-headline">
                <h3 className="escopo-page__aval-title">Faixa de avaliação</h3>
                <span className="escopo-page__aval-badge">Global</span>
              </div>
              <SelectField
                dense
                id="escopo-aval-tier-global"
                label="Obrigatório para precificar — vale para todos os escopos com avaliação ligada."
                value={state.assessmentTierId ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_ASSESSMENT_TIER',
                    tierId: e.target.value || null,
                  })
                }
              >
                <option value="">Selecione uma faixa…</option>
                {assessmentTiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="escopo-page__stack">
        {SECTION_KEYS.map((key) => {
          const open = openSection === key
          const sec = state.sections[key]
          return (
            <Card key={key} className={`scope-cat ${open ? 'scope-cat--open' : ''}`}>
              <button
                type="button"
                className="scope-cat__header"
                onClick={() => setOpenSection(open ? null : key)}
                aria-expanded={open}
              >
                <span className="scope-cat__heading">
                  <span className="escopo-page__icon">{META[key].icon}</span>
                  <span className="scope-cat__copy">
                    <span className="scope-cat__title">{META[key].title}</span>
                    <span className="scope-cat__subtitle">{META[key].subtitle}</span>
                  </span>
                </span>
                <ChevronDown
                  size={20}
                  className={`scope-cat__chevron ${open ? 'scope-cat__chevron--up' : ''}`}
                />
              </button>
              {open ? (
                <div className="scope-cat__body">
                  <FieldGroup
                    label="Palavras-chave"
                    hint="Digite e pressione Enter para criar cada termo."
                  >
                    <TagInput
                      tags={sec.keywords}
                      onChange={(keywords) =>
                        dispatch({
                          type: 'SET_SECTION_KEYWORDS',
                          section: key,
                          keywords,
                        })
                      }
                      placeholder="Ex.: termos de busca…"
                    />
                  </FieldGroup>
                  <TextField
                    id={`vol-${key}`}
                    label="Volume estimado (notícias / mês)"
                    type="number"
                    min={0}
                    step={1}
                    value={sec.volume || ''}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_SECTION_VOLUME',
                        section: key,
                        volume: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                  <div className="escopo-page__services-block">
                    <ServiceToggleGrid
                      variant="compact"
                      selected={sec.services}
                      onToggle={(service: MatterServiceKey) =>
                        dispatch({
                          type: 'TOGGLE_SECTION_SERVICE',
                          section: key,
                          service,
                        })
                      }
                    />
                  </div>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
