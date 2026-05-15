import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'
import '../shared/field.css'

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  dense?: boolean
}

export function SelectField({
  label,
  hint,
  id: idProp,
  dense,
  className,
  disabled,
  children,
  ...rest
}: SelectFieldProps) {
  const uid = useId()
  const id = idProp ?? uid
  const rootCls = ['ui-field', dense ? 'ui-field--dense' : '', className || '']
    .filter(Boolean)
    .join(' ')
  const shellCls = [
    'ui-field__select-shell',
    disabled ? 'ui-field__select-shell--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootCls}>
      <div className="ui-field__meta">
        <label className="ui-field__label" htmlFor={id}>
          {label}
        </label>
        {hint ? <p className="ui-field__hint">{hint}</p> : null}
      </div>
      <div className={shellCls}>
        <select
          id={id}
          className="ui-field__select"
          disabled={disabled}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="ui-field__select-chevron"
          size={16}
          strokeWidth={2}
          aria-hidden
        />
      </div>
    </div>
  )
}
