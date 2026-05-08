import {
  BarChart3,
  BookMarked,
  Clock,
  FileJson,
  FolderOpen,
  HelpCircle,
  Plus,
  Settings,
  Users,
} from 'lucide-react'
import { Button } from '../ui/Button'
import './Sidebar.css'

interface SidebarProps {
  onNovaProposta: () => void
}

export function Sidebar({ onNovaProposta }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          <BarChart3 size={22} strokeWidth={2} />
        </span>
        <div>
          <div className="sidebar__title">Calculadora de Proposta</div>
          <div className="sidebar__tagline">Monitoramento de Mídia</div>
        </div>
      </div>

      <Button
        variant="primary"
        className="sidebar__cta"
        onClick={onNovaProposta}
      >
        <Plus size={18} strokeWidth={2} />
        Nova Proposta
      </Button>

      <nav className="sidebar__nav" aria-label="Principal">
        <a className="sidebar__link sidebar__link--active" href="#">
          <FolderOpen size={18} />
          Propostas Salvas
        </a>
        <a className="sidebar__link" href="#">
          <Users size={18} />
          Clientes
        </a>
        <a className="sidebar__link" href="#">
          <BookMarked size={18} />
          Modelos de Proposta
        </a>
        <a className="sidebar__link" href="#">
          <Clock size={18} />
          Histórico de Cálculos
        </a>
        <a className="sidebar__link" href="#">
          <Settings size={18} />
          Configurações
        </a>
      </nav>

      <div className="sidebar__help">
        <HelpCircle size={18} className="sidebar__help-icon" />
        <div className="sidebar__help-title">Precisa de ajuda?</div>
        <p className="sidebar__help-text">
          Assista ao guia rápido para montar uma proposta em minutos.
        </p>
        <Button variant="secondary" className="sidebar__help-btn">
          Assistir guia rápido
        </Button>
      </div>

      <div className="sidebar__footer-note">
        <FileJson size={14} />
        <span>Rascunho local · sem backend</span>
      </div>
    </aside>
  )
}
