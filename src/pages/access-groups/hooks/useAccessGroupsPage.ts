import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AccessGroup } from '@/features/access-groups/types'
import {
  loadAccessGroups,
  saveAccessGroups,
} from '@/features/access-groups/accessGroupStorage'
import { getAllPermissionIds } from '@/features/access-groups/permissions'
import { loadUsers } from '@/features/auth/api/userStorage'
import {
  countUsersForGroup,
  DESCRIPTION_MAX,
  newGroupId,
  usersAssignedToGroup,
} from '@/pages/access-groups/lib/accessGroupsLib'

const ALL_IDS = getAllPermissionIds()

export type EditorMode = 'list' | 'new' | 'edit'

export function useAccessGroupsPage() {
  const [groups, setGroups] = useState<AccessGroup[]>(() => loadAccessGroups())
  const [mode, setMode] = useState<EditorMode>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AccessGroup | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [editorTab, setEditorTab] = useState<'info' | 'users'>('info')
  const [listSearch, setListSearch] = useState('')
  const [listView, setListView] = useState<'list' | 'grid'>('list')
  const [listFilter, setListFilter] = useState<'all' | 'active'>('all')
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)

  const reload = useCallback(() => {
    setGroups(loadAccessGroups())
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
    setActiveId(null)
    setMode('new')
  }, [])

  const openEdit = useCallback(
    (g: AccessGroup, tab: 'info' | 'users' = 'info') => {
      setDraft({ ...g, permissionIds: [...g.permissionIds] })
      setActiveId(g.id)
      setEditorTab(tab)
      setMode('edit')
      setMenuOpenId(null)
    },
    [],
  )

  const backToList = useCallback(() => {
    setMode('list')
    setDraft(null)
    setActiveId(null)
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
    } else {
      persistGroups(groups.map((g) => (g.id === normalized.id ? normalized : g)))
    }
    backToList()
  }, [draft, mode, groups, persistGroups, backToList])

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

  const assignedUsers = draft ? usersAssignedToGroup(draft.id) : []
  const assignedCount =
    mode === 'new' ? 0 : draft ? countUsersForGroup(draft.id) : 0

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
  }
}
