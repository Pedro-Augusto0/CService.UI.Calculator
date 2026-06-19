import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { ApiError } from '@/features/api/client'
import { createClientApi, fetchClients } from '@/features/api/clientsApi'
import type { ApiClient } from '@/features/api/types'
import '@/components/ui/shared/field.css'
import './ClientSearchSelect.css'

export interface ClientSearchSelectValue {
  clientId: number | null
  clientName: string
}

interface ClientSearchSelectProps {
  value: ClientSearchSelectValue
  onChange: (value: ClientSearchSelectValue) => void
  label: string
  labelIcon?: ReactNode
  placeholder?: string
  disabled?: boolean
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export function ClientSearchSelect({
  value,
  onChange,
  label,
  labelIcon,
  placeholder = 'Buscar ou selecionar cliente…',
  disabled = false,
}: ClientSearchSelectProps) {
  const rootId = useId()
  const listboxId = `${rootId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [clients, setClients] = useState<ApiClient[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    setError(null)
    try {
      setClients(await fetchClients('', true))
    } catch {
      setClients([])
      setError('Não foi possível carregar os clientes.')
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  useEffect(() => {
    if (!open) return

    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setError(null)
      window.requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return clients
    return clients.filter((client) => normalize(client.name).includes(q))
  }, [clients, query])

  const trimmedQuery = query.trim()
  const hasExactMatch = useMemo(
    () =>
      trimmedQuery.length > 0 &&
      clients.some((client) => normalize(client.name) === normalize(trimmedQuery)),
    [clients, trimmedQuery],
  )

  const showCreateOption =
    trimmedQuery.length > 0 && !hasExactMatch && !creating

  function selectClient(client: ApiClient) {
    onChange({ clientId: client.id, clientName: client.name })
    setOpen(false)
    setError(null)
  }

  async function handleCreateClient() {
    if (!trimmedQuery || hasExactMatch || creating) return

    setCreating(true)
    setError(null)

    try {
      const created = await createClientApi(trimmedQuery)
      setClients((prev) => {
        const next = [created, ...prev.filter((item) => item.id !== created.id)]
        return next.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      })
      selectClient(created)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível criar o cliente.'
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  const triggerLabel = value.clientName || placeholder

  return (
    <div
      ref={rootRef}
      className={`client-search-select${open ? ' client-search-select--open' : ''}`}
    >
      <div className="ui-field__meta">
        <label
          className={`ui-field__label${labelIcon ? ' ui-field__label--with-icon' : ''}`}
          htmlFor={`${rootId}-trigger`}
        >
          {labelIcon ? (
            <span className="ui-field__label-icon" aria-hidden>
              {labelIcon}
            </span>
          ) : null}
          {label}
        </label>
      </div>

      <button
        id={`${rootId}-trigger`}
        type="button"
        className="client-search-select__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
        }}
      >
        {value.clientName ? (
          triggerLabel
        ) : (
          <span className="client-search-select__placeholder">{triggerLabel}</span>
        )}
      </button>
      <ChevronDown
        size={16}
        strokeWidth={2}
        className="client-search-select__chevron"
        aria-hidden
      />

      {open ? (
        <div className="client-search-select__panel">
          <div className="client-search-select__search-wrap">
            <Search
              size={16}
              strokeWidth={2}
              className="client-search-select__search-icon"
              aria-hidden
            />
            <input
              ref={searchRef}
              type="search"
              className="client-search-select__search"
              value={query}
              placeholder="Digite para buscar…"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setOpen(false)
                  return
                }
                if (event.key === 'Enter' && showCreateOption) {
                  event.preventDefault()
                  void handleCreateClient()
                }
              }}
              aria-controls={listboxId}
              autoComplete="off"
            />
          </div>

          <div
            id={listboxId}
            className="client-search-select__list"
            role="listbox"
            aria-label="Clientes"
          >
            {initialLoading ? (
              <p className="client-search-select__loading">Carregando…</p>
            ) : null}

            {!initialLoading && filtered.length === 0 && !showCreateOption ? (
              <p className="client-search-select__empty">
                Nenhum cliente encontrado.
              </p>
            ) : null}

            {filtered.map((client) => {
              const selected = value.clientId === client.id
              return (
                <button
                  key={client.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`client-search-select__option${
                    selected ? ' client-search-select__option--selected' : ''
                  }`}
                  onClick={() => selectClient(client)}
                >
                  {client.name}
                </button>
              )
            })}

            {showCreateOption ? (
              <button
                type="button"
                className="client-search-select__option client-search-select__option--create"
                onClick={() => void handleCreateClient()}
              >
                <Plus size={16} strokeWidth={2} aria-hidden />
                Criar cliente &quot;{trimmedQuery}&quot;
              </button>
            ) : null}

            {creating ? (
              <p className="client-search-select__loading">Criando cliente…</p>
            ) : null}
          </div>

          {error ? (
            <p className="client-search-select__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
