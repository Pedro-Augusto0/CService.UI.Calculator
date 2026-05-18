import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AccessGroup } from '@/features/access-groups/types'
import {
  loadAccessGroups,
  saveAccessGroups,
} from '@/features/access-groups/accessGroupStorage'
import { getAllPermissionIds } from '@/features/access-groups/permissions'
import { loadUsers, saveUsers } from '@/features/auth/api/userStorage'
import {
  addUserToGroup,
  removeUserFromGroup,
  userBelongsToGroup,
} from '@/features/auth/groupIds'
import {
  countUsersForGroup,
  DESCRIPTION_MAX,
  newGroupId,
} from '@/pages/access-groups/lib/accessGroupsLib'

const ALL_IDS = getAllPermissionIds()

export type EditorMode = 'list' | 'new' | 'edit'
export type EditorTabName = 'info' | 'permissions' | 'users'
/** Fluxo guiado na criação: 0 = só Informações; 1 = Permissões liberada; 2 = Usuários liberada. */
export type NewCreationStep = 0 | 1 | 2

export function useAccessGroupsPage() {
  const [groups, setGroups] = useState<AccessGroup[]>(() => loadAccessGroups())
  const [mode, setMode] = useState<EditorMode>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AccessGroup | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [editorTab, setEditorTab] = useState<EditorTabName>('info')
  const [newGroupStagingIds, setNewGroupStagingIds] = useState<string[]>([])
  const [newCreationStep, setNewCreationStep] = useState<NewCreationStep>(0)
  const [usersTick, setUsersTick] = useState(0)
  const [listSearch, setListSearch] = useState('')
  const [listView, setListView] = useState<'list' | 'grid'>('list')
  const [listFilter, setListFilter] = useState<'all' | 'active'>('all')
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)

  const reload = useCallback(() => {
    setGroups(loadAccessGroups())
  }, [])

  const bumpUsers = useCallback(() => {
    setUsersTick((x) => x + 1)
  }, [])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as HTMLElement
      if (t.closest('.access-groups__menu-wrap')) return
      if (t.closest('.access-groups__filter-anchor')) return
      setMenuOpenId(null)
      setFilterMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.name.localeCompare(b.name, 'pt')),
    [groups],
  )

  const filteredListGroups = useMemo(() => {
    let rows = sortedGroups
    if (listFilter === 'active') {
      rows = rows.filter((g) => g.active !== false)
    }
    const q = listSearch.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q),
    )
  }, [sortedGroups, listSearch, listFilter])

  const listStats = useMemo(() => {
    const usersTotal = loadUsers().length
    const groupsTotal = groups.length
    const permSlots = groups.reduce(
      (acc, g) => acc + g.permissionIds.length,
      0,
    )
    return { groupsTotal, usersTotal, permSlots }
  }, [groups])

  const openNew = useCallback(() => {
    setDraft({
      id: newGroupId(),
      name: '',
      description: '',
      color: 'purple',
      iconKey: 'shield',
      permissionIds: [],
      active: true,
    })
    setEditorTab('info')
    setNewGroupStagingIds([])
    setNewCreationStep(0)
    setActiveId(null)
    setMode('new')
  }, [])

  const openEdit = useCallback(
    (g: AccessGroup, tab: EditorTabName = 'info') => {
      setDraft({ ...g, permissionIds: [...g.permissionIds] })
      setActiveId(g.id)
      setEditorTab(tab)
      setNewGroupStagingIds([])
      setMode('edit')
      setMenuOpenId(null)
    },
    [],
  )

  const backToList = useCallback(() => {
    setMode('list')
    setDraft(null)
    setActiveId(null)
    setNewGroupStagingIds([])
    setNewCreationStep(0)
  }, [])

  const persistGroups = useCallback(
    (next: AccessGroup[]) => {
      saveAccessGroups(next)
      reload()
    },
    [reload],
  )

  const handleSave = useCallback(() => {
    if (!draft) return
    if (mode === 'new' && editorTab !== 'users') {
      window.alert(
        'Para concluir o cadastro, avance até a aba Usuários com o botão no topo da página.',
      )
      return
    }
    const name = draft.name.trim()
    if (!name) {
      window.alert('Informe o nome do grupo.')
      return
    }
    const description = draft.description.trim().slice(0, DESCRIPTION_MAX)
    const normalized: AccessGroup = {
      ...draft,
      name,
      description,
      permissionIds: [...new Set(draft.permissionIds)].filter((id) =>
        ALL_IDS.includes(id),
      ),
      active: draft.active !== false,
    }

    if (mode === 'new') {
      persistGroups([...groups, normalized])
      const stage = [...newGroupStagingIds]
      if (stage.length) {
        const target = new Set(stage)
        const nextUsers = loadUsers().map((u) =>
          target.has(u.id) ? addUserToGroup(u, normalized.id) : u,
        )
        saveUsers(nextUsers)
        bumpUsers()
      }
      setNewGroupStagingIds([])
    } else {
      persistGroups(groups.map((g) => (g.id === normalized.id ? normalized : g)))
    }
    backToList()
  }, [
    draft,
    mode,
    editorTab,
    groups,
    persistGroups,
    backToList,
    newGroupStagingIds,
    bumpUsers,
  ])

  const handleDelete = useCallback(
    (g: AccessGroup) => {
      const n = countUsersForGroup(g.id)
      if (n > 0) {
        window.alert(
          `Não é possível excluir o grupo "${g.name}" porque ${n} usuário(s) estão vinculados a ele.`,
        )
        setMenuOpenId(null)
        return
      }
      if (
        !window.confirm(
          `Excluir o grupo "${g.name}"? Esta ação não pode ser desfeita.`,
        )
      ) {
        setMenuOpenId(null)
        return
      }
      persistGroups(groups.filter((x) => x.id !== g.id))
      setMenuOpenId(null)
      if (mode !== 'list' && activeId === g.id) backToList()
    },
    [groups, persistGroups, mode, activeId, backToList],
  )

  const togglePermission = useCallback((id: string) => {
    setDraft((prev) => {
      if (!prev) return prev
      const has = prev.permissionIds.includes(id)
      const permissionIds = has
        ? prev.permissionIds.filter((x) => x !== id)
        : [...prev.permissionIds, id]
      return { ...prev, permissionIds }
    })
  }, [])

  const selectAllPermissions = useCallback((checked: boolean) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        permissionIds: checked ? [...ALL_IDS] : [],
      }
    })
  }, [])

  const allSelected =
    draft !== null && ALL_IDS.every((id) => draft.permissionIds.includes(id))
  const someSelected =
    draft !== null &&
    draft.permissionIds.length > 0 &&
    !allSelected

  const allUsersSnapshot = useMemo(() => loadUsers(), [usersTick])

  const assignedUsers = useMemo(() => {
    if (!draft) return []
    if (mode === 'new') {
      const take = new Set(newGroupStagingIds)
      return allUsersSnapshot
        .filter((u) => take.has(u.id))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt'))
    }
    return allUsersSnapshot
      .filter((u) => userBelongsToGroup(u, draft.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  }, [draft, mode, newGroupStagingIds, allUsersSnapshot])

  const assignedCount = assignedUsers.length

  const assignUsersToDraftGroup = useCallback(
    (userIds: string[]) => {
      if (!draft || userIds.length === 0) return
      if (mode === 'new') {
        setNewGroupStagingIds((prev) => [...new Set([...prev, ...userIds])])
        return
      }
      const add = new Set(userIds)
      const nextUsers = loadUsers().map((u) =>
        add.has(u.id) ? addUserToGroup(u, draft.id) : u,
      )
      saveUsers(nextUsers)
      bumpUsers()
    },
    [draft, mode, bumpUsers],
  )

  const removeUsersFromDraftGroup = useCallback(
    (userIds: string[]) => {
      if (!draft || userIds.length === 0) return
      if (mode === 'new') {
        const drop = new Set(userIds)
        setNewGroupStagingIds((prev) => prev.filter((id) => !drop.has(id)))
        return
      }
      const drop = new Set(userIds)
      const nextUsers = loadUsers().map((u) => {
        if (!drop.has(u.id)) return u
        if (!userBelongsToGroup(u, draft.id)) return u
        return removeUserFromGroup(u, draft.id)
      })
      saveUsers(nextUsers)
      bumpUsers()
    },
    [draft, mode, bumpUsers],
  )

  const removeAllUsersFromDraftGroup = useCallback(() => {
    if (!draft) return
    if (mode === 'new') {
      setNewGroupStagingIds([])
      return
    }
    const gid = draft.id
    const nextUsers = loadUsers().map((u) =>
      userBelongsToGroup(u, gid) ? removeUserFromGroup(u, gid) : u,
    )
    saveUsers(nextUsers)
    bumpUsers()
  }, [draft, mode, bumpUsers])

  const advanceNewGroupToPermissions = useCallback(() => {
    if (!draft || mode !== 'new') return
    if (!draft.name.trim()) {
      window.alert('Informe o nome do grupo para continuar.')
      return
    }
    setNewCreationStep((s) => (s >= 1 ? s : 1))
    setEditorTab('permissions')
  }, [draft, mode])

  const advanceNewGroupToUsers = useCallback(() => {
    if (mode !== 'new') return
    setNewCreationStep((s) => (s >= 2 ? s : 2))
    setEditorTab('users')
  }, [mode])

  return {
    mode,
    draft,
    setDraft,
    menuOpenId,
    setMenuOpenId,
    editorTab,
    setEditorTab,
    listSearch,
    setListSearch,
    listView,
    setListView,
    listFilter,
    setListFilter,
    filterMenuOpen,
    setFilterMenuOpen,
    sortedGroups,
    filteredListGroups,
    listStats,
    openNew,
    openEdit,
    backToList,
    handleSave,
    handleDelete,
    togglePermission,
    selectAllPermissions,
    allSelected,
    someSelected,
    assignedUsers,
    assignedCount,
    allUsersSnapshot,
    assignUsersToDraftGroup,
    removeUsersFromDraftGroup,
    removeAllUsersFromDraftGroup,
    newCreationStep,
    advanceNewGroupToPermissions,
    advanceNewGroupToUsers,
  }
}
