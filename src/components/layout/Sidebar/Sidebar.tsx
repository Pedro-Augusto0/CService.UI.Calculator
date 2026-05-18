import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  CirclePlus,
  FileText,
  FolderOpen,
  type LucideIcon,
  LogOut,
  Settings,
  Shield,
  UserRound,
  Users,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import logoClipping from '@/assets/logocs-aberto.png'
import { initialsFromName } from '@/utils/strings'
import type { MainAppRoute } from '@/routes/main-app.types'
import { Button } from '@/components/ui/Button'
import './Sidebar.css'

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
  route?: MainAppRoute
  isActive?: boolean
  onClick?: () => void
}

export function Sidebar({
  onNovaProposta,
  activeRoute,
  onNavigate,
}: SidebarProps) {
  const { user, logout } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!accountOpen) return
    function onDoc(e: MouseEvent) {
      if (
        accountWrapRef.current &&
        !accountWrapRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [accountOpen])

  const primaryItems: SidebarNavItem[] = [
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
      icon: FolderOpen,
      isActive: activeRoute === 'templates',
      onClick: () => onNavigate('templates'),
    },
  ]

  const adminItems: SidebarNavItem[] = user?.isAdmin
    ? [
        {
          label: 'Usuários',
          icon: UserRound,
          isActive: activeRoute === 'users',
          onClick: () => onNavigate('users'),
        },
        {
          label: 'Grupos de acesso',
          icon: Shield,
          isActive: activeRoute === 'groups',
          onClick: () => onNavigate('groups'),
        },
        {
          label: 'Configurações',
          icon: Settings,
          isActive: activeRoute === 'settings',
          onClick: () => onNavigate('settings'),
        },
      ]
    : []

  function renderNavButton({
    label,
    icon: Icon,
    isActive = false,
    onClick,
  }: SidebarNavItem) {
    const clickable = typeof onClick === 'function'
    return (
      <button
        key={label}
        type="button"
        disabled={!clickable}
        className={`sidebar__link${isActive ? ' sidebar__link--active' : ''}${!clickable ? ' sidebar__link--disabled' : ''}`}
        onClick={onClick}
      >
        <Icon size={18} strokeWidth={1.85} />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-lockup">
          <img className="sidebar__logo" src={logoClipping} alt="CService" />
          <div className="sidebar__brand-tagline">
            Calculadora de propostas
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        className="sidebar__cta"
        onClick={onNovaProposta}
      >
        <CirclePlus size={17} strokeWidth={2} />
        Nova proposta
      </Button>

      <nav className="sidebar__nav" aria-label="Principal">
        {primaryItems.map((item) => renderNavButton(item))}
      </nav>

      {adminItems.length > 0 ? (
        <>
          <div className="sidebar__admin-heading" aria-hidden>
            Administração
          </div>
          <nav
            className="sidebar__nav sidebar__nav--admin"
            aria-label="Administração"
          >
            {adminItems.map((item) => renderNavButton(item))}
          </nav>
        </>
      ) : null}

      {user ? (
        <div
          className="sidebar__account-wrap"
          ref={accountWrapRef}
        >
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
              className="sidebar__account-chevron"
              aria-expanded={accountOpen}
              aria-haspopup="true"
              aria-label="Menu da conta"
              onClick={() => setAccountOpen((o) => !o)}
            >
              <ChevronDown size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
          {accountOpen ? (
            <div className="sidebar__account-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className="sidebar__account-dropdown-item"
                onClick={() => {
                  setAccountOpen(false)
                  logout()
                }}
              >
                <LogOut size={16} strokeWidth={1.85} aria-hidden />
                Sair
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  )
}
