import { LayoutGrid, List } from 'lucide-react'
import './ViewModeToggle.css'

export type ViewMode = 'grid' | 'list'

export function ViewModeToggle({
  value,
  onChange,
  className = '',
  iconSize = 18,
}: {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
  iconSize?: number
}) {
  return (
    <div
      className={['ui-view-mode-toggle', className].filter(Boolean).join(' ')}
      role="group"
      aria-label="Modo de visualização"
    >
      <button
        type="button"
        className={
          value === 'grid'
            ? 'ui-view-mode-toggle__btn ui-view-mode-toggle__btn--active'
            : 'ui-view-mode-toggle__btn'
        }
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        aria-label="Grade"
      >
        <LayoutGrid size={iconSize} strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        className={
          value === 'list'
            ? 'ui-view-mode-toggle__btn ui-view-mode-toggle__btn--active'
            : 'ui-view-mode-toggle__btn'
        }
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        aria-label="Lista"
      >
        <List size={iconSize} strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}
