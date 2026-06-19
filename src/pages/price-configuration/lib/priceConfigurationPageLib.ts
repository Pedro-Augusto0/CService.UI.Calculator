import {
  FileBarChart,
  HeartHandshake,
  Layers,
  Radar,
  type LucideIcon,
} from 'lucide-react'
import type { ConfigTabId } from '@/features/pricing-config/types'

export const TAB_PANEL_INFO: Record<ConfigTabId, string> = {
  monitoramentos:
    'Valores dos monitoramentos por canal: print, web, internacional, rádio, TV e faixas de redes sociais.',
  matter:
    'Para cada serviço, escolha o modo de cobrança (fixo, variável ou ambos) e configure os valores. O comercial usa estes valores na proposta sem editar.',
  reports:
    'Relatórios são cobrados por frequência. CService BI tem setup único + manutenção mensal recorrente.',
  additionals:
    'Adicionais cobrados como fixo, faixa ou percentual sobre o total. Alertas, API, newsletter e modificadores.',
}

export interface ConfigTabItem {
  id: ConfigTabId
  label: string
  title: string
  description: string
  icon: LucideIcon
}

/** Ordem das abas na configuração de preços (primeira = padrão ao abrir). */
export const CONFIG_TABS: ConfigTabItem[] = [
  {
    id: 'monitoramentos',
    label: 'Monitoramentos',
    title: 'Monitoramentos',
    description:
      'Impresso, web, web internacional, rádio, TV, mídias sociais e stories.',
    icon: Radar,
  },
  {
    id: 'matter',
    label: 'Serviços por Matéria',
    title: 'Serviços por Matéria',
    description:
      'Modo de cobrança e valores dos 6 serviços do catálogo. Avaliação usa faixas de preço configuráveis.',
    icon: Layers,
  },
  {
    id: 'reports',
    label: 'Relatórios e BI',
    title: 'Relatórios, Análises e BI',
    description:
      'Relatório Executivo (PowerPoint), Estratégico (HTML) e CService BI (setup e manutenção).',
    icon: FileBarChart,
  },
  {
    id: 'additionals',
    label: 'Serviços Adicionais',
    title: 'Serviços adicionais',
    description:
      'Alertas web, API, newsletter, destinatários extras e modificadores percentuais.',
    icon: HeartHandshake,
  },
]
