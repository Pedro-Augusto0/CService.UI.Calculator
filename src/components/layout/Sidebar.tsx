import {
  BookMarked,
  CirclePlus,
  Clock3,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  type LucideIcon,
  Play,
  Settings,
  Users,
} from 'lucide-react'
import logoClipping from '../../assets/logo_clipping.png'
import { Button } from '../ui/Button'
import './Sidebar.css'

export type MainAppRoute = 'wizard' | 'saved' | 'settings'

interface SidebarProps {
  onNovaProposta: () => void
  activeRoute: MainAppRoute
  onNavigate: (route: MainAppRoute) => void
  onPreviewProposal: () => void
  showProposalPreview?: boolean
}

interface SidebarNavItem {
  label: string
  icon: LucideIcon
  isActive?: boolean
  onClick?: () => void
}

export function Sidebar({
  onNovaProposta,
  activeRoute,
  onNavigate,
}: SidebarProps) {
  const navItems: SidebarNavItem[] = [
    {
      label: 'Propostas salvas',
      icon: FileText,
      isActive: activeRoute === 'saved',
      onClick: () => onNavigate('saved'),
    },
    {
      label: 'Clientes',
      icon: Users,
    },
    {
      label: 'Modelos de proposta',
      icon: BookMarked,
    },
    {
      label: 'Histórico de cálculos',
      icon: Clock3,
    },
    {
      label: 'Configurações',
      icon: Settings,
      isActive: activeRoute === 'settings',
      onClick: () => onNavigate('settings'),
    },
    {
      label: 'Tabela de preços',
      icon: FileSpreadsheet,
    },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-lockup">
          <img className="sidebar__logo" src={logoClipping} alt="CService" />
          <div className="sidebar__title">Calculadora de Propostas</div>
        </div>
      </div>

      <Button
        variant="primary"
        className="sidebar__cta"
        onClick={onNovaProposta}
      >
        <CirclePlus size={16} strokeWidth={2} />
        Nova proposta
      </Button>

      <nav className="sidebar__nav" aria-label="Principal">
        {navItems.map(({ label, icon: Icon, isActive = false, onClick }) => (
          <button
            key={label}
            type="button"
            className={`sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            onClick={onClick}
          >
            <Icon size={17} strokeWidth={1.9} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__help">
        <HelpCircle size={18} className="sidebar__help-icon" />
        <div className="sidebar__help-title">Precisa de ajuda?</div>
        <p className="sidebar__help-text">
          Assista ao guia rápido para montar uma proposta em minutos.
        </p>
        <Button variant="secondary" className="sidebar__help-btn">
          <Play size={14} strokeWidth={2} />
          Assistir guia rápido
        </Button>
      </div>
    </aside>
  )
}
