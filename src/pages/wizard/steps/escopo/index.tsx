import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Building2,
  BriefcaseBusiness,
  ChevronDown,
  Tag,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
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
  marcas: {
    title: 'Próprio',
    subtitle: 'Marcas próprias e derivados.',
    icon: <Tag size={20} strokeWidth={2} />,
  },
  concorrentes: {
    title: 'Concorrentes',
    subtitle: 'Concorrentes diretos ou indiretos.',
    icon: <Users size={20} strokeWidth={2} />,
  },
  setor: {
    title: 'Setor',
    subtitle: 'Termos de setor / macroeconomia.',
    icon: <Building2 size={20} strokeWidth={2} />,
  },
}

export function Escopo() {
  const { state, dispatch } = useProposal()
  const [openSection, setOpenSection] = useState<SectionKey | null>(SECTION_KEYS[0])

  const avaliacaoTiers = state.prices.matterServices.avaliacao.tiers

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
                      avaliacaoTierId={state.avaliacaoTierId}
                      avaliacaoTiers={avaliacaoTiers}
                      onAvaliacaoTierChange={(tierId) =>
                        dispatch({ type: 'SET_AVALIACAO_TIER', tierId })
                      }
                      avaliacaoSelectIdSuffix={key}
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
