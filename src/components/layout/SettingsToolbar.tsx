import { Download, Eye } from 'lucide-react'
import { Button } from '../ui/Button'
import './SettingsToolbar.css'

interface SettingsToolbarProps {
  onPreviewProposal: () => void
  onDownload: () => void
}

export function SettingsToolbar({
  onPreviewProposal,
  onDownload,
}: SettingsToolbarProps) {
  return (
    <header className="settings-toolbar">
      <div className="settings-toolbar__spacer" aria-hidden />
      <div className="settings-toolbar__actions">
        <Button variant="secondary" onClick={onPreviewProposal}>
          <Eye size={18} strokeWidth={2} aria-hidden />
          Visualizar proposta
        </Button>
        <Button variant="primary" onClick={onDownload}>
          <Download size={18} strokeWidth={2} aria-hidden />
          Salvar e gerar proposta
        </Button>
      </div>
    </header>
  )
}
