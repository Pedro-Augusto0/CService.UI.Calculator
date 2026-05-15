import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import './TagInput.css'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function commit() {
    const t = draft.trim()
    if (!t) return
    if (!tags.includes(t)) onChange([...tags, t])
    setDraft('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-input">
      <div className="tag-input__chips">
        {tags.map((t) => (
          <span key={t} className="tag-input__chip">
            {t}
            <button
              type="button"
              className="tag-input__chip-remove"
              aria-label={`Remover ${t}`}
              onClick={() => onChange(tags.filter((x) => x !== t))}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          className="tag-input__field"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
        />
      </div>
    </div>
  )
}
