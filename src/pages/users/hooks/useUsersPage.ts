import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import type { StoredUser } from '@/features/auth/types'
import { loadAccessGroups } from '@/features/access-groups/accessGroupStorage'
import { loadUsers, saveUsers } from '@/features/auth/api/userStorage'
import { withUserGroupIds } from '@/features/auth/groupIds'
import { isActiveInWindow, type RoleFilter } from '@/pages/users/lib/usersPageLib'

export function useUsersPage() {
  const { user: sessionUser, refreshSessionUser } = useAuth()
  const accessGroups = loadAccessGroups()
  const [rows, setRows] = useState<StoredUser[]>(() => loadUsers())
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setSelectedIds(new Set())
  }, [query, roleFilter])

  const reload = useCallback(() => {
    setRows(loadUsers())
    refreshSessionUser()
  }, [refreshSessionUser])

  const stats = useMemo(() => {
    const t = Date.now()
    const total = rows.length
    const admins = rows.filter((u) => u.isAdmin).length
    const active = rows.filter((u) => isActiveInWindow(u, t)).length
    const groupsTotal = accessGroups.length
    return { total, admins, active, groupsTotal }
  }, [rows, accessGroups.length])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((u) => {
      if (roleFilter === 'admin' && !u.isAdmin) return false
      if (roleFilter === 'user' && u.isAdmin) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
  }, [rows, query, roleFilter])

  const adminCount = useMemo(
    () => rows.filter((u) => u.isAdmin).length,
    [rows],
  )

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.has(u.id))

  const someFilteredSelected = filtered.some((u) => selectedIds.has(u.id))

  const persist = useCallback(
    (next: StoredUser[]) => {
      saveUsers(next)
      reload()
      setSelectedIds(new Set())
    },
    [reload],
  )

  const handleToggleAdmin = useCallback(
    (target: StoredUser, nextAdmin: boolean) => {
      if (!sessionUser) return
      if (target.isAdmin === nextAdmin) return

      if (target.isAdmin && !nextAdmin && adminCount <= 1) {
        window.alert(
          'É necessário manter pelo menos um administrador na plataforma.',
        )
        return
      }

      const next = rows.map((u) => {
        if (u.id !== target.id) return u
        const groupIdsNext = nextAdmin
          ? ['grp-administrador']
          : ['grp-leitura']
        return {
          ...withUserGroupIds(u, groupIdsNext),
          isAdmin: nextAdmin,
        }
      })
      persist(next)
    },
    [sessionUser, adminCount, rows, persist],
  )

  const handleRemove = useCallback(
    (target: StoredUser) => {
      if (!sessionUser) return
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
      const next = rows.filter((u) => u.id !== target.id)
      persist(next)
    },
    [sessionUser, rows, persist],
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

  return {
    sessionUser,
    accessGroups,
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
    handleToggleAdmin,
    handleRemove,
    toggleSelectAllFiltered,
    toggleRowSelected,
  }
}
