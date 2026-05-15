import './Toggle.css'

interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
}: ToggleProps) {
  return (
    <div className={`ui-toggle ${disabled ? 'ui-toggle--disabled' : ''}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`ui-toggle__track ${checked ? 'ui-toggle__track--on' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className="ui-toggle__thumb" />
      </button>
      <div className="ui-toggle__text">
        <span className="ui-toggle__label">{label}</span>
        {description ? (
          <span className="ui-toggle__desc">{description}</span>
        ) : null}
      </div>
    </div>
  )
}
