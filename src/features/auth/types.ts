export interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  isAdmin: boolean
  isMasterAdmin?: boolean
  /** Conta ativa no sistema (API). Ausente em dados locais legados. */
  isActive?: boolean
  /** Preenchido apenas pelo sistema; nunca exibido em cadastro ou perfil. */
  internalField: string
  createdAt: number
  /** Último login bem-sucedido (ms epoch). Ausente em contas antigas. */
  lastLoginAt?: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isMasterAdmin?: boolean
  internalField: string
}

export interface AuthSessionPayload {
  userId: string
  remember: boolean
}
