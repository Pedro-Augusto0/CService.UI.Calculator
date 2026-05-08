import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { SummaryPanel } from './SummaryPanel'
import { TopBar } from './TopBar'
import './AppShell.css'

interface AppShellProps {
  children: ReactNode
  stepper: ReactNode
  onNovaProposta: () => void
  onOpenPrices: () => void
  onPreview: () => void
  onDownload: () => void
}

export function AppShell({
  children,
  stepper,
  onNovaProposta,
  onOpenPrices,
  onPreview,
  onDownload,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar onNovaProposta={onNovaProposta} />
      <div className="app-shell__column">
        <div className="app-shell__inner">
          <TopBar
            onOpenPrices={onOpenPrices}
            onPreview={onPreview}
            onDownload={onDownload}
          />
          <div className="app-shell__stepper">{stepper}</div>
          <div className="app-shell__body">
            <div className="app-shell__main">{children}</div>
            <SummaryPanel onDownload={onDownload} />
          </div>
        </div>
      </div>
    </div>
  )
}
