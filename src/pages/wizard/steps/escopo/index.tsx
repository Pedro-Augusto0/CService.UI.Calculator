import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Building2,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  Tag,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { FieldGroup, TextField } from '@/components/ui/TextField'
import { TagInput } from '@/components/ui/TagInput'
import { SECTION_KEYS, type SectionKey } from '@/domain/types'
import { SECTION_LABELS } from '@/domain/prices'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import './Escopo.css'

const META: Record<SectionKey, { subtitle: string; icon: ReactNode }> = {
  marcas: {
    subtitle: 'Marcas próprias e derivados.',
    icon: <Tag size={20} strokeWidth={2} />,
  },
  concorrentes: {
    subtitle: 'Concorrentes diretos ou indiretos.',
    icon: <Users size={20} strokeWidth={2} />,
  },
  setor: {
    subtitle: 'Termos de setor / macroeconomia.',
    icon: <Building2 size={20} strokeWidth={2} />,
  },
}

export function Escopo() {
  const { state, dispatch } = useProposal()
  const [openSection, setOpenSection] = useState<SectionKey | null>(SECTION_KEYS[0])

  return (
    <div className="page-etapa escopo-page">
      <Card className="escopo-page__meta-card">
        <div className="escopo-page__meta-head">
          <span className="escopo-page__meta-icon" aria-hidden>
            <BriefcaseBusiness size={18} strokeWidth={2} />
          </span>
          <div>
            <h2 className="escopo-page__meta-title">Identificação da proposta</h2>
            <p className="escopo-page__meta-text">
              Esses dados aparecem na tela de propostas salvas e no nome padrão do arquivo exportado.
            </p>
          </div>
        </div>
        <div className="escopo-page__meta-grid">
          <TextField
            label="Cliente"
            placeholder="Ex.: Petrobras"
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
            label="Nome interno da proposta"
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
                    <span className="scope-cat__title">{SECTION_LABELS[key]}</span>
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
                      placeholder="Ex.: Petrobras, Vale…"
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
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
