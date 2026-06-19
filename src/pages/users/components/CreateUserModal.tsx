import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import type { CreateUserRole } from '@/features/api/usersApi'
import './CreateUserModal.css'

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: CreateUserRole
}

interface CreateUserModalProps {
  open: boolean
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: CreateUserInput) => void
}

const emptyForm = (): CreateUserInput => ({
  name: '',
  email: '',
  password: '',
  role: 'user',
})

export function CreateUserModal({
  open,
  busy,
  error,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const titleId = useId()
  const [form, setForm] = useState<CreateUserInput>(emptyForm)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(emptyForm())
    setLocalError(null)
  }, [open])

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

    if (!form.name.trim()) {
      setLocalError('Informe o nome do usuário.')
      return
    }
    if (!form.email.trim()) {
      setLocalError('Informe o e-mail.')
      return
    }
    if (form.password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    })
  }

  const displayError = localError ?? error

  return (
    <div
      className="create-user-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <div
        className="create-user-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="create-user-modal__header">
          <div>
            <h2 id={titleId} className="create-user-modal__title">
              Novo usuário
            </h2>
            <p className="create-user-modal__lead">
              Crie uma conta e defina o perfil de acesso.
            </p>
          </div>
          <button
            type="button"
            className="create-user-modal__close"
            aria-label="Fechar"
            disabled={busy}
            onClick={onClose}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form className="create-user-modal__body" onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            autoComplete="name"
            required
          />

          <TextField
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            autoComplete="off"
            required
          />

          <TextField
            label="Senha"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            autoComplete="new-password"
            minLength={6}
            required
          />

          <div className="create-user-modal__role">
            <label className="create-user-modal__role-label" htmlFor="create-user-role">
              Perfil
            </label>
            <select
              id="create-user-role"
              className="create-user-modal__role-select"
              value={form.role}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  role: e.target.value as CreateUserRole,
                }))
              }
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
              <option value="master">Master admin</option>
            </select>
          </div>

          {displayError ? (
            <p className="create-user-modal__error" role="alert">
              {displayError}
            </p>
          ) : null}

          <div className="create-user-modal__footer">
            <Button variant="ghost" type="button" disabled={busy} onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? 'Criando…' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
