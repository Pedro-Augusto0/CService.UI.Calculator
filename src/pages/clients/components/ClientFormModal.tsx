import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import type { ApiClient } from '@/features/api/types'
import './ClientFormModal.css'

interface ClientFormModalProps {
  open: boolean
  client: ApiClient | null
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: { name: string; isActive: boolean }) => void
}

export function ClientFormModal({
  open,
  client,
  busy,
  error,
  onClose,
  onSubmit,
}: ClientFormModalProps) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(client?.name ?? '')
    setIsActive(client?.isActive ?? true)
    setLocalError(null)
  }, [open, client])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (!name.trim()) {
      setLocalError('Informe o nome do cliente.')
      return
    }

    onSubmit({ name: name.trim(), isActive })
  }

  const displayError = localError ?? error

  return (
    <div
      className="client-form-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <div
        className="client-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="client-form-modal__header">
          <div>
            <h2 id={titleId} className="client-form-modal__title">
              {client ? 'Editar cliente' : 'Novo cliente'}
            </h2>
            <p className="client-form-modal__lead">
              {client
                ? 'Atualize o nome ou status do cliente.'
                : 'Cadastre um cliente para vincular às propostas.'}
            </p>
          </div>
          <button
            type="button"
            className="client-form-modal__close"
            aria-label="Fechar"
            disabled={busy}
            onClick={onClose}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form className="client-form-modal__body" onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="organization"
            required
          />

          {client ? (
            <label className="client-form-modal__checkbox">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Cliente ativo
            </label>
          ) : null}

          {displayError ? (
            <p className="client-form-modal__error" role="alert">
              {displayError}
            </p>
          ) : null}

          <div className="client-form-modal__footer">
            <Button variant="ghost" type="button" disabled={busy} onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? 'Salvando…' : client ? 'Salvar alterações' : 'Criar cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
