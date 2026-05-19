import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import './SaveProposalTemplateModal.css'

interface SaveProposalTemplateModalProps {
  open: boolean
  onClose: () => void
  onSave: (name: string, description: string) => void
}

export function SaveProposalTemplateModal({
  open,
  onClose,
  onSave,
}: SaveProposalTemplateModalProps) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName('')
    setDescription('')
    setError(null)
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Informe um nome para o modelo.')
      return
    }
    onSave(trimmed, description.trim())
    onClose()
  }

  return (
    <div
      className="save-template-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="save-template-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="save-template-modal__header">
          <div>
            <h2 id={titleId} className="save-template-modal__title">
              Salvar como modelo
            </h2>
            <p className="save-template-modal__lead">
              A estrutura atual (serviços, broadcast, extras e distribuição) será
              guardada. Cliente, volume e termos não entram no modelo — o
              preenchimento continua em cada proposta.
            </p>
          </div>
          <button
            type="button"
            className="save-template-modal__close"
            aria-label="Fechar"
            onClick={onClose}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="save-template-modal__body">
          <TextField
            label="Nome do modelo"
            hint="Ex.: Monitoramento Cliente X — padrão comercial"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            placeholder="Nome visível na lista de modelos"
            autoComplete="off"
          />
          <div className="ui-field">
            <div className="ui-field__meta">
              <label className="ui-field__label" htmlFor="save-template-desc">
                Descrição do modelo
              </label>
              <p className="ui-field__hint">
                Explique para a equipe quando usar este modelo e o que ele cobre
                (pacote, perfil de cliente, entregáveis).
              </p>
            </div>
            <textarea
              id="save-template-desc"
              className="save-template-modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Inclui Centimetragem e Screenshot, sem IA. Use para contas enxutas."
            />
          </div>
          {error ? <p className="save-template-modal__error">{error}</p> : null}
        </div>
        <div className="save-template-modal__footer">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="button" onClick={handleSubmit}>
            Salvar modelo
          </Button>
        </div>
      </div>
    </div>
  )
}
