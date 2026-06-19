import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '@/features/api/client'
import {
  createClientApi,
  fetchClients,
  updateClientApi,
} from '@/features/api/clientsApi'
import { useApi } from '@/features/api/config'
import type { ApiClient } from '@/features/api/types'
import { useAuth } from '@/features/auth/AuthContext'

export function useClientsPage() {
  const { user: sessionUser } = useAuth()
  const apiEnabled = useApi()
  const [rows, setRows] = useState<ApiClient[]>([])
  const [loading, setLoading] = useState(apiEnabled)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'all'>('active')
  const showInactive = statusFilter === 'all'
  const [formOpen, setFormOpen] = useState(false)
  const [editClient, setEditClient] = useState<ApiClient | null>(null)
  const [formBusy, setFormBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const canManageClients = Boolean(sessionUser?.isAdmin)

  const reload = useCallback(async () => {
    if (!apiEnabled) {
      setRows([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      setRows(await fetchClients('', !showInactive))
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [apiEnabled, showInactive])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((client) => client.name.toLowerCase().includes(q))
  }, [rows, query])

  const stats = useMemo(() => {
    const total = rows.length
    const active = rows.filter((client) => client.isActive).length
    return { total, active, inactive: total - active }
  }, [rows])

  const openCreateModal = useCallback(() => {
    setEditClient(null)
    setFormError(null)
    setFormOpen(true)
  }, [])

  const openEditModal = useCallback((client: ApiClient) => {
    setEditClient(client)
    setFormError(null)
    setFormOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    if (formBusy) return
    setFormOpen(false)
    setEditClient(null)
    setFormError(null)
  }, [formBusy])

  const handleSubmitClient = useCallback(
    async (input: { name: string; isActive: boolean }) => {
      if (!canManageClients) return

      setFormBusy(true)
      setFormError(null)

      try {
        if (editClient) {
          await updateClientApi(editClient.id, {
            name: input.name,
            isActive: input.isActive,
          })
        } else {
          await createClientApi(input.name)
        }

        setFormOpen(false)
        setEditClient(null)
        await reload()
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : editClient
              ? 'Não foi possível atualizar o cliente.'
              : 'Não foi possível criar o cliente.'
        setFormError(message)
      } finally {
        setFormBusy(false)
      }
    },
    [canManageClients, editClient, reload],
  )

  return {
    apiEnabled,
    loading,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    filtered,
    stats,
    canManageClients,
    formOpen,
    editClient,
    formBusy,
    formError,
    openCreateModal,
    openEditModal,
    closeFormModal,
    handleSubmitClient,
  }
}
