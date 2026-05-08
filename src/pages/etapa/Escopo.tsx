import type { ReactNode } from 'react'
import { Building2, Tag, Users } from 'lucide-react'
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

  return (
    <div className="page-etapa escopo-page">
      <div className="page-etapa__intro">
        <h1 className="page-etapa__title">Escopo do monitoramento</h1>
        <p className="page-etapa__lead">
          Defina palavras-chave e volumes estimados por categoria. Você pode
          pré-selecionar serviços por tipo já nesta etapa ou refiná-los na
          próxima.
        </p>
      </div>

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

      <button type="button" className="escopo-page__ghost-link" disabled>
        + Adicionar outra categoria{' '}
        <span className="escopo-page__hint">(MVP: 3 categorias fixas)</span>
      </button>
    </div>
  )
}
