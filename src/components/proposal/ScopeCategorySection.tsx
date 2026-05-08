import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Card } from '../ui/Card'
import { FieldGroup, TextField } from '../ui/TextField'
import { TagInput } from '../ui/TagInput'
import { ServiceToggleGrid } from './ServiceToggleGrid'
import type { MonitoringServiceKey } from '../../domain/types'
import type { SectionKey } from '../../domain/types'
import './ScopeCategorySection.css'

interface ScopeCategorySectionProps {
  sectionKey: SectionKey
  title: string
  subtitle?: string
  leading?: ReactNode
  keywords: string[]
  volume: number
  services: Record<MonitoringServiceKey, boolean>
  defaultOpen?: boolean
  onKeywordsChange: (k: string[]) => void
  onVolumeChange: (v: number) => void
  onServiceToggle: (s: MonitoringServiceKey) => void
}

export function ScopeCategorySection({
  sectionKey,
  title,
  subtitle,
  leading,
  keywords,
  volume,
  services,
  defaultOpen = true,
  onKeywordsChange,
  onVolumeChange,
  onServiceToggle,
}: ScopeCategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card className={`scope-cat ${open ? 'scope-cat--open' : ''}`}>
      <button
        type="button"
        className="scope-cat__header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="scope-cat__heading">
          {leading}
          <span>
            <span className="scope-cat__title">{title}</span>
            {subtitle ? (
              <span className="scope-cat__subtitle">{subtitle}</span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          size={20}
          className={`scope-cat__chevron ${open ? 'scope-cat__chevron--up' : ''}`}
        />
      </button>
      {open ? (
        <div className="scope-cat__body">
          <FieldGroup
            label="Palavras-chave"
            hint="Digite e pressione Enter para criar cada termo."
            dense
          >
            <TagInput
              tags={keywords}
              onChange={onKeywordsChange}
              placeholder="Ex.: Petrobras, Vale…"
            />
          </FieldGroup>
          <TextField
            dense
            id={`vol-${sectionKey}`}
            label="Volume estimado (notícias / mês)"
            type="number"
            min={0}
            step={1}
            value={volume || ''}
            onChange={(e) =>
              onVolumeChange(Number.parseInt(e.target.value, 10) || 0)
            }
          />
          <FieldGroup label="Serviços aplicados" dense>
            <ServiceToggleGrid
              variant="compact"
              selected={services}
              onToggle={onServiceToggle}
            />
          </FieldGroup>
        </div>
      ) : null}
    </Card>
  )
}
