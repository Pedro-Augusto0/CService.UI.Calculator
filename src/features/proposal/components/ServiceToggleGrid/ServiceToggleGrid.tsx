import type { LucideIcon } from 'lucide-react'
import {
  Camera,
  ClipboardCheck,
  Gauge,
  Highlighter,
  Newspaper,
  Sparkles,
} from 'lucide-react'
import { MATTER_SERVICE_LABELS } from '@/domain/prices'
import type { MatterServiceKey } from '@/domain/types'
import { MATTER_SERVICE_KEYS } from '@/domain/types'
import './ServiceToggleGrid.css'

const ICONS: Record<MatterServiceKey, LucideIcon> = {
  columnInches: Newspaper,
  highlight: Highlighter,
  score: Gauge,
  ai: Sparkles,
  screenshot: Camera,
  assessment: ClipboardCheck,
}

const DESCRIPTIONS: Record<MatterServiceKey, string> = {
  columnInches: 'Centimetragem ou valoração editorial.',
  highlight: 'Destaque dos trechos mais relevantes.',
  score: 'Pontuação de relevância da matéria.',
  ai: 'Enriquecimento com IA (sentimento, contexto).',
  screenshot: 'Captura visual da publicação.',
  assessment: 'Classificação customizada com faixa de campos.',
}

interface ServiceToggleGridProps {
  variant?: 'compact' | 'large'
  selected: Record<MatterServiceKey, boolean>
  onToggle: (key: MatterServiceKey) => void
}

export function ServiceToggleGrid({
  variant = 'compact',
  selected,
  onToggle,
}: ServiceToggleGridProps) {
  const cls =
    variant === 'large'
      ? 'service-grid service-grid--large'
      : 'service-grid service-grid--compact'

  return (
    <div className={cls} role="group" aria-label="Serviços por matéria">
      {MATTER_SERVICE_KEYS.map((key) => {
        const Icon = ICONS[key]
        const on = selected[key]
        const itemCls = [
          'service-grid__item',
          on ? 'service-grid__item--on' : '',
          variant === 'large' ? 'service-grid__item--card' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div key={key} className={itemCls}>
            <button
              type="button"
              className="service-grid__item-main"
              onClick={() => onToggle(key)}
              aria-pressed={on}
            >
              <span className="service-grid__icon">
                <Icon size={variant === 'large' ? 22 : 18} strokeWidth={1.75} />
              </span>
              <span className="service-grid__label">{MATTER_SERVICE_LABELS[key]}</span>
              {variant === 'large' ? (
                <span className="service-grid__desc">{DESCRIPTIONS[key]}</span>
              ) : null}
            </button>
          </div>
        )
      })}
    </div>
  )
}
