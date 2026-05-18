import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Target,
} from 'lucide-react'
import { BUILTIN_TEMPLATE_CARDS } from '@/features/proposal/lib/proposalTemplates'

export function ProposalTemplatesKpiSection({
  customTemplatesCount,
}: {
  customTemplatesCount: number
}) {
  return (
    <section className="proposal-templates-page__kpis" aria-label="Resumo">
      <div className="proposal-templates-page__kpi">
        <div
          className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--blue"
          aria-hidden
        >
          <Briefcase size={22} strokeWidth={2} />
        </div>
        <div>
          <p className="proposal-templates-page__kpi-value">
            {BUILTIN_TEMPLATE_CARDS.length + customTemplatesCount}
          </p>
          <p className="proposal-templates-page__kpi-label">Modelos criados</p>
          <p className="proposal-templates-page__kpi-hint">
            Padrão do sistema + seus modelos salvos
          </p>
        </div>
      </div>
      <div className="proposal-templates-page__kpi">
        <div
          className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--green"
          aria-hidden
        >
          <BarChart3 size={22} strokeWidth={2} />
        </div>
        <div>
          <p className="proposal-templates-page__kpi-value">7</p>
          <p className="proposal-templates-page__kpi-label">Mais utilizados</p>
          <p className="proposal-templates-page__kpi-hint">
            Usados nos últimos 30 dias
          </p>
        </div>
      </div>
      <div className="proposal-templates-page__kpi">
        <div
          className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--green"
          aria-hidden
        >
          <Target size={22} strokeWidth={2} />
        </div>
        <div>
          <p className="proposal-templates-page__kpi-value">85%</p>
          <p className="proposal-templates-page__kpi-label">Agilidade</p>
          <p className="proposal-templates-page__kpi-hint">
            Propostas criadas com modelos
          </p>
        </div>
      </div>
      <div className="proposal-templates-page__kpi">
        <div
          className="proposal-templates-page__kpi-icon proposal-templates-page__kpi-icon--purple"
          aria-hidden
        >
          <ClipboardList size={22} strokeWidth={2} />
        </div>
        <div>
          <p className="proposal-templates-page__kpi-value">24</p>
          <p className="proposal-templates-page__kpi-label">
            Propostas geradas
          </p>
          <p className="proposal-templates-page__kpi-hint">
            A partir de modelos este mês
          </p>
        </div>
      </div>
    </section>
  )
}
