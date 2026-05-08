import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './field.css'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  dense?: boolean
}

export function TextField({
  label,
  hint,
  id: idProp,
  dense,
  className,
  ...rest
}: TextFieldProps) {
  const uid = useId()
  const id = idProp ?? uid
  const rootCls = ['ui-field', dense ? 'ui-field--dense' : '', className || '']
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
      <input id={id} className="ui-field__control" {...rest} />
    </div>
  )
}

interface FieldGroupProps {
  label: string
  hint?: string
  dense?: boolean
  className?: string
  children: ReactNode
}

/** Label + conteúdo livre (TagInput, grids) com o mesmo ritmo dos campos. */
export function FieldGroup({
  label,
  hint,
  dense,
  className,
  children,
}: FieldGroupProps) {
  const rootCls = ['ui-field', dense ? 'ui-field--dense' : '', className || '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootCls}>
      <div className="ui-field__meta">
        <span className="ui-field__label">{label}</span>
        {hint ? <p className="ui-field__hint">{hint}</p> : null}
      </div>
      <div className="ui-field__control-slot">{children}</div>
    </div>
  )
}
