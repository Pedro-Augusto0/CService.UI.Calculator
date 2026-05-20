import { Plus, Trash2 } from 'lucide-react'
import { useId, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { PtDecimalField, PtIntegerField } from '@/components/ui/PtDecimalField'
import { TextField } from '@/components/ui/TextField'
import './TierEditor.css'

export interface TierEditorColumn<T> {
  key: keyof T & string
  label: string
  type: 'text' | 'integer' | 'decimal'
}

interface TierEditorProps<T extends { id: string }> {
  title: string
  description: string
  emptyHint?: string
  tiers: T[]
  columns: TierEditorColumn<T>[]
  onChange: (tiers: T[]) => void
  createTier: () => T
}

export function TierEditor<T extends { id: string }>({
  title,
  description,
  emptyHint,
  tiers,
  columns,
  onChange,
  createTier,
}: TierEditorProps<T>) {
  const baseId = useId()

  const gridTemplateColumns = useMemo(() => {
    const n = columns.length
    /** Índice + N colunas flex + ação fixa */
    return `2rem ${Array.from({ length: n }, () => 'minmax(3.75rem, 1fr)').join(' ')} 2.25rem`
  }, [columns.length])

  function updateRow(index: number, patch: Partial<T>) {
    onChange(
      tiers.map((row, i) => (i === index ? ({ ...row, ...patch } as T) : row)),
    )
  }

  function removeRow(index: number) {
    onChange(tiers.filter((_, i) => i !== index))
  }

  function addRow() {
    onChange([...tiers, createTier()])
  }

  function renderCell(row: T, index: number, col: TierEditorColumn<T>) {
    const value = row[col.key] as unknown
    const fieldId = `${baseId}-${row.id}-${col.key}`

    if (col.type === 'text') {
      return (
        <TextField
          key={col.key}
          dense
          id={fieldId}
          label={col.label}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) =>
            updateRow(index, {
              [col.key]: e.target.value,
            } as Partial<T>)
          }
        />
      )
    }

    if (col.type === 'integer') {
      return (
        <PtIntegerField
          key={col.key}
          id={fieldId}
          label={col.label}
          value={typeof value === 'number' ? value : 0}
          onCommit={(n) =>
            updateRow(index, {
              [col.key]: n,
            } as Partial<T>)
          }
        />
      )
    }

    return (
      <PtDecimalField
        key={col.key}
        id={fieldId}
        label={col.label}
        value={typeof value === 'number' ? value : 0}
        onCommit={(n) =>
          updateRow(index, {
            [col.key]: n,
          } as Partial<T>)
        }
      />
    )
  }

  return (
    <section className="tier-editor">
      <header className="tier-editor__head">
        <div className="tier-editor__copy">
          <h4 className="tier-editor__title">{title}</h4>
          <p className="tier-editor__desc">{description}</p>
        </div>
        <Button
          variant="secondary"
          type="button"
          className="tier-editor__add-btn"
          onClick={addRow}
        >
          <Plus size={15} strokeWidth={2} aria-hidden />
          Nova faixa
        </Button>
      </header>

      {tiers.length === 0 ? (
        <p className="tier-editor__empty">
          {emptyHint ?? 'Nenhuma faixa cadastrada. Clique em "Nova faixa" para começar.'}
        </p>
      ) : (
        <div className="tier-editor__sheet-scroll">
          <div
            className="tier-editor__sheet"
            role="grid"
            aria-label={title}
            style={{ minWidth: `${32 + columns.length * 88 + 44}px` }}
          >
            <div
              className="tier-editor__sheet-row tier-editor__sheet-row--head"
              role="row"
              style={{ gridTemplateColumns }}
            >
              <div className="tier-editor__cell tier-editor__cell--idx" role="columnheader">
                #
              </div>
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="tier-editor__cell tier-editor__cell--th"
                  role="columnheader"
                >
                  {col.label}
                </div>
              ))}
              <div
                className="tier-editor__cell tier-editor__cell--th tier-editor__cell--action-head"
                role="columnheader"
              >
                <span className="tier-editor__sr-only">Remover</span>
              </div>
            </div>

            {tiers.map((row, index) => (
              <div
                key={row.id}
                className="tier-editor__sheet-row tier-editor__sheet-row--data"
                role="row"
                style={{ gridTemplateColumns }}
              >
                <div
                  className="tier-editor__cell tier-editor__cell--idx"
                  aria-hidden
                >
                  {index + 1}
                </div>
                {columns.map((col) => (
                  <div key={col.key} className="tier-editor__cell tier-editor__cell--field">
                    {renderCell(row, index, col)}
                  </div>
                ))}
                <div className="tier-editor__cell tier-editor__cell--action">
                  <button
                    type="button"
                    className="tier-editor__remove"
                    onClick={() => removeRow(index)}
                    aria-label={`Remover faixa ${index + 1}`}
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
