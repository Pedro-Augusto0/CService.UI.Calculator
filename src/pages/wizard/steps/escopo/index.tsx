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
import { Toggle } from '@/components/ui/Toggle'
import { SelectField } from '@/components/ui/SelectField'
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

  const avaliacaoSelected = SECTION_KEYS.some(
    (k) => state.sections[k].services.avaliacao,
  )
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
          </div>
        </div>
        <Toggle
          checked={state.applyServicesToAll}
          onChange={(v) =>
            dispatch({ type: 'SET_APPLY_SERVICES_TO_ALL', value: v })
          }
          label="Aplicar serviços por matéria a todas as categorias"
          description="Quando ligado, ativar ou desativar um serviço em uma categoria replica a mesma seleção nas demais."
        />
        {avaliacaoSelected ? (
          <div className="escopo-page__aval-wrap">
            <SelectField
              dense
              id="escopo-aval-tier"
              label="Faixa da Avaliação (quantidade de campos)"
              hint="Tabela configurada pelo administrador."
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
