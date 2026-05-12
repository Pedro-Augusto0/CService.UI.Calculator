import type { ReactNode } from 'react'
import { useState } from 'react'
import { Building2, BriefcaseBusiness, FileText, Tag, Users } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { TextField } from '../../components/ui/TextField'
import { SECTION_KEYS } from '../../domain/types'
import { SECTION_LABELS } from '../../domain/prices'
import type { MonitoringServiceKey } from '../../domain/types'
import { ScopeCategorySection } from '../../components/proposal/ScopeCategorySection'
import { useProposal } from '../../proposal/ProposalProvider'
import './Escopo.css'

const META: Record<
  (typeof SECTION_KEYS)[number],
  { subtitle: string; icon: ReactNode }
> = {
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
  const [openSection, setOpenSection] =
    useState<(typeof SECTION_KEYS)[number] | null>(SECTION_KEYS[0])

  return (
    <div className="page-etapa escopo-page">
      <Card className="escopo-page__meta-card">
        <div className="escopo-page__meta-head">
          <span className="escopo-page__meta-icon" aria-hidden>
            <BriefcaseBusiness size={18} strokeWidth={2} />
          </span>
          <div>
            <h2 className="escopo-page__meta-title">Identificacao da proposta</h2>
            <p className="escopo-page__meta-text">
              Esses dados aparecem na tela de propostas salvas e no nome padrao do arquivo exportado.
            </p>
          </div>
        </div>
        <div className="escopo-page__meta-grid">
          <TextField
            dense
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
            dense
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
        {SECTION_KEYS.map((key, idx) => (
          <ScopeCategorySection
            key={key}
            sectionKey={key}
            title={SECTION_LABELS[key]}
            subtitle={META[key].subtitle}
            leading={<span className="escopo-page__icon">{META[key].icon}</span>}
            keywords={state.sections[key].keywords}
            volume={state.sections[key].volume}
            services={state.sections[key].services}
            defaultOpen={idx === 0}
            open={openSection === key}
            onOpenChange={(nextOpen) => setOpenSection(nextOpen ? key : null)}
            onKeywordsChange={(keywords) =>
              dispatch({ type: 'SET_SECTION_KEYWORDS', section: key, keywords })
            }
            onVolumeChange={(volume) =>
              dispatch({ type: 'SET_SECTION_VOLUME', section: key, volume })
            }
            onServiceToggle={(service: MonitoringServiceKey) =>
              dispatch({
                type: 'TOGGLE_SECTION_SERVICE',
                section: key,
                service,
              })
            }
          />
        ))}
      </div>

     
    </div>
  )
}
