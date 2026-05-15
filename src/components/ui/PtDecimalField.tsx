import { useEffect, useState } from 'react'

export function formatPtDecimal(n: number, fractionDigits = 2) {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function parsePtDecimal(raw: string) {
  const trimmed = raw.trim().replace(/\./g, '').replace(',', '.')
  const n = Number.parseFloat(trimmed)
  return Number.isFinite(n) ? n : 0
}

interface PtDecimalFieldProps {
  id: string
  label: string
  value: number
  onCommit: (n: number) => void
  fractionDigits?: number
}

export function PtDecimalField({
  id,
  label,
  value,
  onCommit,
  fractionDigits = 2,
}: PtDecimalFieldProps) {
  const [str, setStr] = useState(() => formatPtDecimal(value, fractionDigits))

  useEffect(() => {
    setStr(formatPtDecimal(value, fractionDigits))
  }, [value, fractionDigits])

  return (
    <div className="ui-field ui-field--dense config-page__base-input-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="ui-field__control"
        inputMode="decimal"
        autoComplete="off"
        value={str}
        onChange={(e) => setStr(e.target.value)}
        onBlur={() => {
          const n = parsePtDecimal(str)
          onCommit(n)
          setStr(formatPtDecimal(n, fractionDigits))
        }}
      />
    </div>
  )
}

interface PtIntegerFieldProps {
  id: string
  label: string
  value: number
  onCommit: (n: number) => void
  min?: number
}

/** Inteiros com formatação pt-BR (sem decimais). */
export function PtIntegerField({
  id,
  label,
  value,
  onCommit,
  min = 0,
}: PtIntegerFieldProps) {
  const [str, setStr] = useState(() =>
    Math.round(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
  )

  useEffect(() => {
    setStr(Math.round(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 }))
  }, [value])

  return (
    <div className="ui-field ui-field--dense config-page__base-input-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="ui-field__control"
        inputMode="numeric"
        autoComplete="off"
        value={str}
        onChange={(e) => setStr(e.target.value)}
        onBlur={() => {
          let n = Math.round(parsePtDecimal(str))
          if (Number.isFinite(min)) n = Math.max(min, n)
          onCommit(n)
          setStr(n.toLocaleString('pt-BR', { maximumFractionDigits: 0 }))
        }}
      />
    </div>
  )
}
