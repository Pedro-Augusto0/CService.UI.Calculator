import type { LucideIcon } from 'lucide-react'
import {
  Camera,
  FileText,
  Gauge,
  Highlighter,
  Ruler,
  Sparkles,
  Star,
} from 'lucide-react'
import type { MonitoringServiceKey } from '../../domain/types'
import { MONITORING_SERVICE_KEYS } from '../../domain/types'
import { MONITORING_LABELS } from '../../domain/prices'
import './ServiceToggleGrid.css'

const ICONS: Record<MonitoringServiceKey, LucideIcon> = {
  texto: FileText,
  centimetragem: Ruler,
  grifo: Highlighter,
  score: Gauge,
  avaliacao: Star,
  ia: Sparkles,
  screenshot: Camera,
}

const DESCRIPTIONS: Record<MonitoringServiceKey, string> = {
  texto: 'News clipping em texto integral.',
  centimetragem: 'Cálculo de centimetragem de coluna.',
  grifo: 'Destaque dos trechos mais relevantes.',
  score: 'Pontuação de relevância do conteúdo.',
  avaliacao: 'Análise qualitativa / crítica.',
  ia: 'Análises automatizadas com IA.',
  screenshot: 'Captura visual da matéria.',
}

interface ServiceToggleGridProps {
  variant?: 'compact' | 'large'
  selected: Record<MonitoringServiceKey, boolean>
  onToggle: (key: MonitoringServiceKey) => void
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
    <div className={cls} role="group" aria-label="Serviços de monitoramento">
      {MONITORING_SERVICE_KEYS.map((key) => {
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
          <button
            key={key}
            type="button"
            className={itemCls}
            onClick={() => onToggle(key)}
            aria-pressed={on}
          >
            <span className="service-grid__icon">
              <Icon size={variant === 'large' ? 22 : 18} strokeWidth={1.75} />
            </span>
            <span className="service-grid__label">{MONITORING_LABELS[key]}</span>
            {variant === 'large' ? (
              <span className="service-grid__desc">{DESCRIPTIONS[key]}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
