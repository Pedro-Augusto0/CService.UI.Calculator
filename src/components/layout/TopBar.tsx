import { Download, Eye, Settings2 } from 'lucide-react'
import { Button } from '../ui/Button'
import './TopBar.css'

interface TopBarProps {
  onOpenPrices: () => void
  onPreview: () => void
  onDownload: () => void
}

export function TopBar({ onOpenPrices, onPreview, onDownload }: TopBarProps) {
  return (
    <header className="topbar">
      <div />
      <div className="topbar__actions">
        <Button variant="secondary" onClick={onOpenPrices}>
          <Settings2 size={18} strokeWidth={1.75} />
          Configurações de preços
        </Button>
        <Button variant="secondary" onClick={onPreview}>
          <Eye size={18} strokeWidth={1.75} />
          Visualizar proposta
        </Button>
        <Button variant="primary" onClick={onDownload}>
          <Download size={18} strokeWidth={1.75} />
          Salvar e gerar proposta
        </Button>
      </div>
    </header>
  )
}
