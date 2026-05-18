import { ProposalTemplatesGridView } from '@/pages/proposal-templates/components/ProposalTemplatesGridView'
import { ProposalTemplatesHero } from '@/pages/proposal-templates/components/ProposalTemplatesHero'
import { ProposalTemplatesKpiSection } from '@/pages/proposal-templates/components/ProposalTemplatesKpiSection'
import { ProposalTemplatesListView } from '@/pages/proposal-templates/components/ProposalTemplatesListView'
import { ProposalTemplatesToolbar } from '@/pages/proposal-templates/components/ProposalTemplatesToolbar'
import { useProposalTemplatesPage } from '@/pages/proposal-templates/hooks/useProposalTemplatesPage'
import './ProposalTemplates.css'

interface ProposalTemplatesProps {
  onNovoModelo: () => void
  onUsarModelo: (templateId: string) => void
}

export function ProposalTemplates({
  onNovoModelo,
  onUsarModelo,
}: ProposalTemplatesProps) {
  const p = useProposalTemplatesPage()

  return (
    <div className="proposal-templates-page">
      <ProposalTemplatesHero
        query={p.query}
        setQuery={p.setQuery}
        onNovoModelo={onNovoModelo}
      />

      <ProposalTemplatesKpiSection
        customTemplatesCount={p.customTemplatesCount}
      />

      <ProposalTemplatesToolbar
        tab={p.tab}
        setTab={p.setTab}
        sort={p.sort}
        setSort={p.setSort}
        view={p.view}
        setView={p.setView}
      />

      {p.view === 'grid' ? (
        <ProposalTemplatesGridView
          rows={p.filteredSorted}
          mostUsedTemplateId={p.mostUsedTemplateId}
          onUsarModelo={onUsarModelo}
        />
      ) : (
        <ProposalTemplatesListView
          rows={p.filteredSorted}
          onUsarModelo={onUsarModelo}
        />
      )}
    </div>
  )
}

export type { TemplateTabId } from '@/pages/proposal-templates/lib/proposalTemplatesPageLib'
