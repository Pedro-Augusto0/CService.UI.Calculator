import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padded?: boolean
}

export function Card({
  children,
  padded = true,
  className = '',
  ...rest
}: CardProps) {
  const cls = ['ui-card', padded ? 'ui-card--padded' : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}
