export interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  isAdmin: boolean
  /** Grupo de acesso (permissões herdadas do grupo). */
  groupId?: string
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
  internalField: string
}

export interface AuthSessionPayload {
  userId: string
  remember: boolean
}
