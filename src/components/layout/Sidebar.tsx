import {
  BookMarked,
  CirclePlus,
  FileText,
  HelpCircle,
  type LucideIcon,
  LogOut,
  Play,
  Settings,
  UserRound,
  Users,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import logoClipping from '../../assets/result_logo_clipping_bg-removed.png'
import { Button } from '../ui/Button'
import './Sidebar.css'

export type MainAppRoute = 'wizard' | 'saved' | 'settings' | 'users'

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

function initialsFromName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
  }
  const single = parts[0] ?? trimmed
  return single.slice(0, 2).toUpperCase()
}

export function Sidebar({
  onNovaProposta,
  activeRoute,
  onNavigate,
}: SidebarProps) {
  const { user, logout } = useAuth()

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
    ...(user?.isAdmin
      ? ([
        {
          label: 'Usuários',
          icon: UserRound,
          isActive: activeRoute === 'users',
          onClick: () => onNavigate('users'),
        },
        {
          label: 'Configurações',
          icon: Settings,
          isActive: activeRoute === 'settings',
          onClick: () => onNavigate('settings'),
        },

      ] satisfies SidebarNavItem[])
      : []),
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

      {user ? (
        <div className="sidebar__account">
          <div className="sidebar__account-avatar" aria-hidden>
            {initialsFromName(user.name)}
          </div>
          <div className="sidebar__account-main">
            <div className="sidebar__account-name">{user.name}</div>
            <div className="sidebar__account-email" title={user.email}>
              {user.email}
            </div>
          </div>
          <button
            type="button"
            className="sidebar__logout"
            onClick={logout}
          >
            <LogOut size={15} strokeWidth={1.9} aria-hidden />
          </button>
        </div>
      ) : null}
    </aside>
  )
}
