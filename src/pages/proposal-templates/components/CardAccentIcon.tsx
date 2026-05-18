import { Globe, Newspaper, Tv, Zap } from 'lucide-react'
import type { TemplateAccent } from '@/pages/proposal-templates/lib/proposalTemplatesPageLib'

export function CardAccentIcon({ accent }: { accent: TemplateAccent }) {
  const iconProps = { size: 15, strokeWidth: 2 }
  switch (accent) {
    case 'violet':
      return <Newspaper {...iconProps} />
    case 'green':
      return <Zap {...iconProps} />
    case 'orange':
      return <Tv {...iconProps} />
    case 'blue':
      return <Globe {...iconProps} />
  }
}
