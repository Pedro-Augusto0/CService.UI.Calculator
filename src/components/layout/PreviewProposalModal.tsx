import './PreviewProposalModal.css'

interface PreviewProposalModalProps {
  open: boolean
  html: string
  onClose: () => void
}

export function PreviewProposalModal({
  open,
  html,
  onClose,
}: PreviewProposalModalProps) {
  if (!open) return null

  return (
    <div className="preview-modal-overlay" role="dialog" aria-modal="true">
      <div className="preview-modal">
        <div className="preview-modal__header">
          <h2 className="preview-modal__title">Pré-visualização</h2>
          <button
            type="button"
            className="preview-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <iframe className="preview-modal__frame" title="Proposta" srcDoc={html} />
      </div>
    </div>
  )
}
