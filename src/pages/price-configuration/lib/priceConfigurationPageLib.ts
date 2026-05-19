import {
  CalendarClock,
  FileBarChart,
  FileCog,
  HeartHandshake,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import type { ConfigTabId } from '@/features/pricing-config/types'

export const TAB_PANEL_INFO: Record<Exclude<ConfigTabId, 'base'>, string> = {
  matter:
    'Para cada serviço, escolha o modo de cobrança (fixo, variável ou ambos) e configure os valores. O comercial usa estes valores na proposta sem editar.',
  reports:
    'Relatórios são cobrados por frequência. CService BI tem setup único + manutenção mensal recorrente.',
  additionals:
    'Adicionais cobrados como fixo, faixa ou percentual sobre o total. As faixas podem ser editadas conforme a evolução comercial.',
  outros:
    'Opções de validade da proposta em dias. O comercial escolhe uma das opções cadastradas aqui ao montar a proposta.',
}

export interface ConfigTabItem {
  id: ConfigTabId
  label: string
  title: string
  description: string
  icon: LucideIcon
}

export const CONFIG_TABS: ConfigTabItem[] = [
  {
    id: 'base',
    label: 'Preço Base',
    title: 'Preço base mensal',
    description:
      'Valor mínimo mensal obrigatório aplicado a todas as propostas.',
    icon: FileCog,
  },
  {
    id: 'matter',
    label: 'Serviços por Matéria',
    title: 'Serviços por Matéria',
    description:
      'Modo de cobrança e valores dos 6 serviços do catálogo. Avaliação possui faixas por quantidade de campos.',
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
      'Rádio, TV, mídias sociais, stories, alertas, API, newsletter e modificadores percentuais.',
    icon: HeartHandshake,
  },
  {
    id: 'outros',
    label: 'Outros',
    title: 'Outros parâmetros',
    description: 'Opções de validade da proposta.',
    icon: CalendarClock,
  },
]
