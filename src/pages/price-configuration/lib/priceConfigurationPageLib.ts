import {
  FileBarChart,
  FileCog,
  HeartHandshake,
  Settings,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import type { ConfigTabId } from '@/features/pricing-config/types'
import type { PriceSettingsSection } from '@/features/pricing-config/components/PriceSettingsFields'

export const TAB_PANEL_INFO: Record<Exclude<ConfigTabId, 'base'>, string> = {
  services:
    'Estes valores definem o quanto cada tipo de monitoramento contribui para o total da proposta. Mantenha a coerência com o pacote comercial ofertado.',
  distribution:
    'Os valores de TV e rádio são cobranças fixas por praça. Atualize-os quando negociar novas tabelas com veículos.',
  reports:
    'Relatórios recorrentes aparecem como linhas fixas na proposta; o preço deve refletir o esforço analítico.',
  extras:
    'Franquias, excessos e APIs alteram o resultado final. Revise estes parâmetros quando mudar políticas de uso.',
}

export interface ConfigTabItem {
  id: ConfigTabId
  label: string
  title: string
  description: string
  icon: LucideIcon
  visibleSections: PriceSettingsSection[]
}

export const CONFIG_TABS: ConfigTabItem[] = [
  {
    id: 'base',
    label: 'Base de cálculo',
    title: 'Base de cálculo',
    description:
      'Parâmetros principais que formam a base para todos os cálculos.',
    icon: FileCog,
    visibleSections: [],
  },
  {
    id: 'services',
    label: 'Serviços monitorados',
    title: 'Serviços monitorados',
    description:
      'Valores unitários cobrados por tipo de serviço no núcleo de monitoramento.',
    icon: Share2,
    visibleSections: ['services'],
  },
  {
    id: 'distribution',
    label: 'Distribuição',
    title: 'Distribuição',
    description:
      'TV e rádio por praça — coberturas fixas que entram na proposta.',
    icon: Settings,
    visibleSections: ['broadcast'],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    title: 'Relatórios',
    description: 'Preços dos entregáveis analíticos recorrentes.',
    icon: FileBarChart,
    visibleSections: ['reports'],
  },
  {
    id: 'extras',
    label: 'Extras',
    title: 'Extras',
    description:
      'Adicionais, franquias e parâmetros que ajustam o total da proposta.',
    icon: HeartHandshake,
    visibleSections: ['additionals'],
  },
]
