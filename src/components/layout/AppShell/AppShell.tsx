import type { ReactNode } from 'react'
import { Sidebar } from '../Sidebar'
import './AppShell.css'

import type { MainAppRoute } from '@/routes/main-app.types'

export type { MainAppRoute }

interface AppShellProps {
  children: ReactNode
  stepper: ReactNode | null
  toolbar?: ReactNode | null
  rightAside: ReactNode | null
  sidebarActiveRoute: MainAppRoute
  onSidebarNavigate: (route: MainAppRoute) => void
  onNovaProposta: () => void
  onPreviewProposal: () => void
  showSidebarProposalPreview?: boolean
}

export function AppShell({
  children,
  stepper,
  toolbar = null,
  rightAside,
  sidebarActiveRoute,
  onSidebarNavigate,
  onNovaProposta,
  onPreviewProposal,
  showSidebarProposalPreview = true,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar
        onNovaProposta={onNovaProposta}
        activeRoute={sidebarActiveRoute}
        onNavigate={onSidebarNavigate}
        onPreviewProposal={onPreviewProposal}
        showProposalPreview={showSidebarProposalPreview}
      />
      <div className="app-shell__column">
        <div className="app-shell__inner">
          {stepper ? (
            <div className="app-shell__stepper">{stepper}</div>
          ) : null}
          {toolbar}
          <div className="app-shell__body">
            <div className="app-shell__main">{children}</div>
            {rightAside}
          </div>
        </div>
      </div>
    </div>
  )
}
