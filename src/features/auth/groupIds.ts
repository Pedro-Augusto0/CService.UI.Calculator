import type { StoredUser } from './types'

/**
 * IDs únicos dos grupos de acesso associados ao usuário.
 * Lê `groupIds` ou, como legado, `groupId` (único).
 */
export function normalizeUserGroupIds(user: StoredUser): string[] {
  const arr = Array.isArray(user.groupIds) ? user.groupIds : []
  const fromArr = [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))]
  if (fromArr.length > 0) return fromArr
  const legacy = user.groupId
  if (legacy !== undefined && legacy !== null) {
    const t = String(legacy).trim()
    if (t !== '') return [t]
  }
  return []
}

export function userBelongsToGroup(user: StoredUser, groupId: string): boolean {
  return normalizeUserGroupIds(user).includes(groupId)
}

export function participatesInStoredGroupCatalog(
  u: StoredUser,
  accessGroups: readonly { id: string }[],
): boolean {
  const known = new Set(accessGroups.map((g) => g.id))
  return normalizeUserGroupIds(u).some((id) => known.has(id))
}

/** Remove `groupId` legado; `groupIds` ausente quando vazio. */
export function withUserGroupIds(
  user: StoredUser,
  nextIds: string[],
): StoredUser {
  const uniq = [...new Set(nextIds.map((id) => id.trim()).filter(Boolean))]
  const { groupId: _legacy, ...rest } = user
  if (uniq.length === 0) return rest as StoredUser
  return { ...(rest as StoredUser), groupIds: uniq }
}

export function addUserToGroup(user: StoredUser, groupId: string): StoredUser {
  const gid = groupId.trim()
  if (!gid) return user
  const ids = normalizeUserGroupIds(user)
  if (ids.includes(gid)) return user
  return withUserGroupIds(user, [...ids, gid])
}

export function removeUserFromGroup(
  user: StoredUser,
  groupId: string,
): StoredUser {
  const gid = groupId.trim()
  const next = normalizeUserGroupIds(user).filter((id) => id !== gid)
  return withUserGroupIds(user, next)
}
