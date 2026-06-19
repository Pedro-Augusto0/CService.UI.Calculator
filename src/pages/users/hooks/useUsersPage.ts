import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApi } from '@/features/api/config'
import { ApiError } from '@/features/api/client'
import {
  createUserApi,
  deleteUserApi,
  fetchUsers,
  roleToFlags,
  updateUserApi,
} from '@/features/api/usersApi'
import { useAuth } from '@/features/auth/AuthContext'
import { createInternalRegistrationField } from '@/features/auth/api/internalRegistration'
import { hashPassword } from '@/features/auth/api/passwordHash'
import type { StoredUser } from '@/features/auth/types'
import { findUserByEmail, loadUsers, saveUsers } from '@/features/auth/api/userStorage'
import type { CreateUserInput } from '@/pages/users/components/CreateUserModal'
import type { EditUserInput } from '@/pages/users/components/EditUserModal'
import { isActiveInWindow, type RoleFilter } from '@/pages/users/lib/usersPageLib'

function isPrivilegedUser(user: StoredUser): boolean {
  return user.isAdmin || Boolean(user.isMasterAdmin)
}

export function useUsersPage() {
  const { user: sessionUser, refreshSessionUser } = useAuth()
  const apiEnabled = useApi()
  const [rows, setRows] = useState<StoredUser[]>(() =>
    apiEnabled ? [] : loadUsers(),
  )
  const [loading, setLoading] = useState(apiEnabled)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [createBusy, setCreateBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<StoredUser | null>(null)
  const [editBusy, setEditBusy] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const canManageUsers = Boolean(sessionUser?.isMasterAdmin)

  const reload = useCallback(async () => {
    if (apiEnabled) {
      setLoading(true)
      try {
        setRows(await fetchUsers())
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    } else {
      setRows(loadUsers())
    }
    refreshSessionUser()
  }, [apiEnabled, refreshSessionUser])

  useEffect(() => {
    if (!apiEnabled) return
    void reload()
  }, [apiEnabled, reload])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [query, roleFilter])

  const stats = useMemo(() => {
    const t = Date.now()
    const total = rows.length
    const admins = rows.filter((u) => isPrivilegedUser(u)).length
    const regularUsers = total - admins
    const active = rows.filter((u) =>
      u.isActive === false ? false : isActiveInWindow(u, t),
    ).length
    return { total, admins, regularUsers, active }
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((u) => {
      if (roleFilter === 'admin' && !isPrivilegedUser(u)) return false
      if (roleFilter === 'user' && isPrivilegedUser(u)) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
  }, [rows, query, roleFilter])

  const adminCount = useMemo(
    () => rows.filter((u) => isPrivilegedUser(u)).length,
    [rows],
  )

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.has(u.id))

  const someFilteredSelected = filtered.some((u) => selectedIds.has(u.id))

  const persist = useCallback(
    (next: StoredUser[]) => {
      if (!apiEnabled) saveUsers(next)
      void reload()
      setSelectedIds(new Set())
    },
    [apiEnabled, reload],
  )

  const handleRemove = useCallback(
    async (target: StoredUser) => {
      if (!sessionUser?.isMasterAdmin) return
      if (target.id === sessionUser.id) {
        window.alert('Não é possível remover o seu próprio usuário.')
        return
      }
      if (
        !window.confirm(
          `Remover o usuário ${target.name} (${target.email})? Esta ação não pode ser desfeita.`,
        )
      ) {
        return
      }

      if (apiEnabled) {
        try {
          await deleteUserApi(target.id)
          await reload()
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : 'Não foi possível remover o usuário.'
          window.alert(message)
        }
        return
      }

      const next = rows.filter((u) => u.id !== target.id)
      persist(next)
    },
    [sessionUser, rows, persist, apiEnabled, reload],
  )

  const toggleSelectAllFiltered = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(filtered.map((u) => u.id)))
  }, [allFilteredSelected, filtered])

  const toggleRowSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const openCreateModal = useCallback(() => {
    setCreateError(null)
    setCreateOpen(true)
  }, [])

  const closeCreateModal = useCallback(() => {
    if (createBusy) return
    setCreateOpen(false)
    setCreateError(null)
  }, [createBusy])

  const openEditModal = useCallback((target: StoredUser) => {
    setEditError(null)
    setEditUser(target)
  }, [])

  const closeEditModal = useCallback(() => {
    if (editBusy) return
    setEditUser(null)
    setEditError(null)
  }, [editBusy])

  const handleCreateUser = useCallback(
    async (input: CreateUserInput) => {
      if (!sessionUser?.isMasterAdmin) return

      setCreateBusy(true)
      setCreateError(null)

      try {
        if (apiEnabled) {
          await createUserApi(input)
        } else {
          const trimmedEmail = input.email.trim()
          const users = loadUsers()
          if (findUserByEmail(users, trimmedEmail)) {
            setCreateError('Este e-mail já está cadastrado.')
            return
          }

          const { isAdmin, isMasterAdmin } = roleToFlags(input.role)
          const record: StoredUser = {
            id:
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `usr_${Date.now()}`,
            name: input.name.trim(),
            email: trimmedEmail,
            passwordHash: await hashPassword(input.password),
            isAdmin,
            isMasterAdmin,
            isActive: true,
            internalField: createInternalRegistrationField(),
            createdAt: Date.now(),
          }
          saveUsers([...users, record])
        }

        setCreateOpen(false)
        await reload()
      } catch (error) {
        const message =
          error instanceof ApiError
            ? (error.errors?.email?.[0] ?? error.message)
            : 'Não foi possível criar o usuário.'
        setCreateError(message)
      } finally {
        setCreateBusy(false)
      }
    },
    [sessionUser, apiEnabled, reload],
  )

  const handleEditUser = useCallback(
    async (input: EditUserInput) => {
      if (!sessionUser?.isMasterAdmin || !editUser) return

      const wasPrivileged = isPrivilegedUser(editUser)
      const nextFlags = roleToFlags(input.role)
      const willBePrivileged = nextFlags.isAdmin || nextFlags.isMasterAdmin

      if (wasPrivileged && !willBePrivileged && adminCount <= 1) {
        setEditError(
          'É necessário manter pelo menos um administrador na plataforma.',
        )
        return
      }

      if (
        wasPrivileged &&
        !input.isActive &&
        adminCount <= 1 &&
        editUser.isActive !== false
      ) {
        setEditError(
          'É necessário manter pelo menos um administrador ativo na plataforma.',
        )
        return
      }

      setEditBusy(true)
      setEditError(null)

      try {
        if (apiEnabled) {
          await updateUserApi(editUser.id, input)
        } else {
          const users = loadUsers()
          const next = await Promise.all(
            users.map(async (u) => {
              if (u.id !== editUser.id) return u

              const updated: StoredUser = {
                ...u,
                name: input.name.trim(),
                isAdmin: nextFlags.isAdmin,
                isMasterAdmin: nextFlags.isMasterAdmin,
                isActive: input.isActive,
              }

              if (input.password) {
                updated.passwordHash = await hashPassword(input.password)
              }

              return updated
            }),
          )
          saveUsers(next)
        }

        setEditUser(null)
        await reload()
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível atualizar o usuário.'
        setEditError(message)
      } finally {
        setEditBusy(false)
      }
    },
    [sessionUser, editUser, adminCount, apiEnabled, reload],
  )

  return {
    sessionUser,
    canManageUsers,
    createOpen,
    createBusy,
    createError,
    openCreateModal,
    closeCreateModal,
    handleCreateUser,
    editUser,
    editBusy,
    editError,
    openEditModal,
    closeEditModal,
    handleEditUser,
    query,
    setQuery,
    roleFilter,
    setRoleFilter,
    stats,
    filtered,
    adminCount,
    selectedIds,
    allFilteredSelected,
    someFilteredSelected,
    loading,
    handleRemove,
    toggleSelectAllFiltered,
    toggleRowSelected,
  }
}
