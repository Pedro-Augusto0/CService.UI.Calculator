import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import type { StoredUser } from '@/features/auth/types'
import { userToRole, type CreateUserRole } from '@/features/api/usersApi'
import '../components/CreateUserModal.css'

export interface EditUserInput {
  name: string
  role: CreateUserRole
  isActive: boolean
  password?: string
}

interface EditUserModalProps {
  user: StoredUser | null
  busy: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: EditUserInput) => void
}

function formFromUser(user: StoredUser): EditUserInput {
  return {
    name: user.name,
    role: userToRole(user),
    isActive: user.isActive ?? true,
    password: '',
  }
}

export function EditUserModal({
  user,
  busy,
  error,
  onClose,
  onSubmit,
}: EditUserModalProps) {
  const titleId = useId()
  const [form, setForm] = useState<EditUserInput | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const open = user !== null

  useEffect(() => {
    if (!user) return
    setForm(formFromUser(user))
    setLocalError(null)
  }, [user])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open || !form || !user) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (!form!.name.trim()) {
      setLocalError('Informe o nome do usuário.')
      return
    }
    if (form!.password && form!.password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    onSubmit({
      name: form!.name.trim(),
      role: form!.role,
      isActive: form!.isActive,
      password: form!.password?.trim() || undefined,
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
              Editar usuário
            </h2>
            <p className="create-user-modal__lead">
              Altere nome, perfil, status ou senha de {user.email}.
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
            onChange={(e) => setForm((prev) => prev && { ...prev, name: e.target.value })}
            autoComplete="name"
            required
          />

          <div className="create-user-modal__role">
            <span className="create-user-modal__role-label">E-mail</span>
            <p className="create-user-modal__readonly">{user.email}</p>
          </div>

          <div className="create-user-modal__role">
            <label className="create-user-modal__role-label" htmlFor="edit-user-role">
              Perfil
            </label>
            <select
              id="edit-user-role"
              className="create-user-modal__role-select"
              value={form.role}
              onChange={(e) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, role: e.target.value as CreateUserRole }
                    : prev,
                )
              }
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
              <option value="master">Master admin</option>
            </select>
          </div>

          <label className="create-user-modal__checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => prev && { ...prev, isActive: e.target.checked })
              }
            />
            Conta ativa
          </label>

          <TextField
            label="Nova senha"
            hint="Deixe em branco para manter a senha atual."
            type="password"
            value={form.password ?? ''}
            onChange={(e) =>
              setForm((prev) => prev && { ...prev, password: e.target.value })
            }
            autoComplete="new-password"
            minLength={6}
          />

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
              {busy ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
