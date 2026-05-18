import { AccessGroupsEditor } from '@/pages/access-groups/components/AccessGroupsEditor'
import { AccessGroupsListing } from '@/pages/access-groups/components/AccessGroupsListing'
import { useAccessGroupsPage } from '@/pages/access-groups/hooks/useAccessGroupsPage'
import './AccessGroups.css'

export function AccessGroups() {
  const p = useAccessGroupsPage()

  if (p.mode !== 'list' && p.draft) {
    return (
      <AccessGroupsEditor
        mode={p.mode}
        draft={p.draft}
        setDraft={p.setDraft}
        backToList={p.backToList}
        handleSave={p.handleSave}
        editorTab={p.editorTab}
        setEditorTab={p.setEditorTab}
        assignedCount={p.assignedCount}
        assignedUsers={p.assignedUsers}
        allUsersSnapshot={p.allUsersSnapshot}
        sortedGroups={p.sortedGroups}
        assignUsersToDraftGroup={p.assignUsersToDraftGroup}
        removeUsersFromDraftGroup={p.removeUsersFromDraftGroup}
        removeAllUsersFromDraftGroup={p.removeAllUsersFromDraftGroup}
        allSelected={p.allSelected}
        someSelected={p.someSelected}
        selectAllPermissions={p.selectAllPermissions}
        togglePermission={p.togglePermission}
        newCreationStep={p.newCreationStep}
        advanceNewGroupToPermissions={p.advanceNewGroupToPermissions}
        advanceNewGroupToUsers={p.advanceNewGroupToUsers}
      />
    )
  }

  return (
    <AccessGroupsListing
      listStats={p.listStats}
      listSearch={p.listSearch}
      setListSearch={p.setListSearch}
      listView={p.listView}
      setListView={p.setListView}
      listFilter={p.listFilter}
      setListFilter={p.setListFilter}
      filterMenuOpen={p.filterMenuOpen}
      setFilterMenuOpen={p.setFilterMenuOpen}
      sortedGroups={p.sortedGroups}
      filteredListGroups={p.filteredListGroups}
      openNew={p.openNew}
      openEdit={p.openEdit}
      handleDelete={p.handleDelete}
      menuOpenId={p.menuOpenId}
      setMenuOpenId={p.setMenuOpenId}
    />
  )
}
