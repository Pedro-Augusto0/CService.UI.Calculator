import { useEffect, useMemo, useState } from 'react'
import {
  Calculator,
  ChevronDown,
  FileBarChart,
  HeartHandshake,
  Lightbulb,
  Settings,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import type { ConfigTabId } from '@/features/pricing-config/types'
import { MONITORING_LABELS, type Prices } from '@/domain/prices'
import { MONITORING_SERVICE_KEYS } from '@/domain/types'
import { formatCurrency } from '@/utils/currency'
import './ConfigPricingSidebar.css'

interface ConfigPricingSidebarProps {
  prices: Prices
  precoBaseMensal: number
  pricingSavedAt: number
  /** Aba ativa no painel principal — destaca a linha correspondente sem repetir o formulário. */
  focusSection?: ConfigTabId
}

type IconTone = 'purple' | 'green' | 'orange' | 'blue'

export function ConfigPricingSidebar({
  prices,
  precoBaseMensal,
  focusSection,
}: ConfigPricingSidebarProps) {
  const [openKey, setOpenKey] = useState<string>('base')

  useEffect(() => {
    const map: Record<ConfigTabId, string> = {
      base: 'base',
      services: 'services',
      distribution: 'distribution',
      reports: 'reports',
      extras: 'extras',
    }
    if (focusSection) setOpenKey(map[focusSection])
  }, [focusSection])

  const broadcastCount: number =
    Object.keys(prices.broadcast.tv).length + Object.keys(prices.broadcast.radio).length
  const reportsCount: number = Object.keys(prices.broadcast.relatorio).length
  const extrasCount: number = Object.keys(prices.additionals).length
  const servicesConfigured: number = MONITORING_SERVICE_KEYS.length

  const broadcastItems = useMemo(
    () => [
      { label: 'TV SP/RJ', value: formatCurrency(prices.broadcast.tv.sp_rj) },
      { label: 'TV Nacional', value: formatCurrency(prices.broadcast.tv.nacional) },
      { label: 'Rádio SP/RJ', value: formatCurrency(prices.broadcast.radio.sp_rj) },
      { label: 'Rádio Nacional', value: formatCurrency(prices.broadcast.radio.nacional) },
    ],
    [prices.broadcast],
  )

  const serviceItems = useMemo(
    () =>
      MONITORING_SERVICE_KEYS.map((k) => ({
        label: MONITORING_LABELS[k],
        value: formatCurrency(prices.servicePrices[k]),
      })),
    [prices.servicePrices],
  )

  const reportItems = useMemo(
    () => [
      { label: 'Relatório mensal', value: formatCurrency(prices.broadcast.relatorio.mensal) },
      { label: 'Relatório semanal', value: formatCurrency(prices.broadcast.relatorio.semanal) },
    ],
    [prices.broadcast.relatorio],
  )

  const extrasItems = useMemo(
    () => [
      {
        label: 'Mídias sociais · posts',
        value: `${prices.additionals.midiasSociaisIncludedPosts}`,
      },
      {
        label: `Excedente · ${prices.additionals.midiasSociaisExcessPostsStep} posts`,
        value: formatCurrency(prices.additionals.midiasSociaisExcessPricePerStep),
      },
      {
        label: 'Alertas web · envio extra',
        value: formatCurrency(prices.additionals.alertasWebPricePerExtraEnvio),
      },
      { label: 'API', value: formatCurrency(prices.additionals.api) },
      { label: 'Stories', value: formatCurrency(prices.additionals.stories) },
      { label: 'Destaques da semana', value: formatCurrency(prices.additionals.destaques) },
    ],
    [prices.additionals],
  )

  function toggle(key: string) {
    setOpenKey((prev) => (prev === key ? '' : key))
  }

  const sections: {
    key: string
    tab: ConfigTabId
    label: string
    summary: string | null
    Icon: LucideIcon
    tone: IconTone
    items: { label: string; value: string }[]
  }[] = [
    {
      key: 'base',
      tab: 'base',
      label: 'Base de cálculo',
      summary: null,
      Icon: Calculator,
      tone: 'purple',
      items: [
        { label: 'Preço base mensal', value: formatCurrency(precoBaseMensal) },
        { label: 'Preço por volume', value: formatCurrency(prices.volumePrice) },
        { label: 'Destinatário-envio-dia', value: formatCurrency(prices.destinatarioPrice) },
      ],
    },
    {
      key: 'services',
      tab: 'services',
      label: 'Serviços monitorados',
      summary:
        servicesConfigured === 1
          ? '1 serviço configurado'
          : `${servicesConfigured} serviços configurados`,
      Icon: Share2,
      tone: 'green',
      items: serviceItems,
    },
    {
      key: 'distribution',
      tab: 'distribution',
      label: 'Distribuição',
      summary:
        broadcastCount === 1
          ? '1 canal configurado'
          : `${broadcastCount} canais configurados`,
      Icon: Settings,
      tone: 'orange',
      items: broadcastItems,
    },
    {
      key: 'reports',
      tab: 'reports',
      label: 'Relatórios',
      summary:
        reportsCount === 1
          ? '1 relatório configurado'
          : `${reportsCount} relatórios configurados`,
      Icon: FileBarChart,
      tone: 'blue',
      items: reportItems,
    },
    {
      key: 'extras',
      tab: 'extras',
      label: 'Extras',
      summary:
        extrasCount === 1
          ? '1 adicional configurado'
          : `${extrasCount} adicionais configurados`,
      Icon: HeartHandshake,
      tone: 'purple',
      items: extrasItems,
    },
  ]

  return (
    <aside className="config-sidebar">
      <header className="config-sidebar__head">
        <h2 className="config-sidebar__title">Resumo da tabela de preços</h2>
        <p className="config-sidebar__sub">
          Visualização rápida dos principais valores.
        </p>
      </header>

      <div className="config-sidebar__accordion" role="list">
        {sections.map(({ key, tab, label, summary, Icon, tone, items }) => {
          const expanded = openKey === key
          const focused = focusSection === tab
          return (
            <div
              key={key}
              role="listitem"
              className={`config-sidebar__acc${focused ? ' config-sidebar__acc--focus' : ''}`}
            >
              <button
                type="button"
                className="config-sidebar__acc-trigger"
                aria-expanded={expanded}
                onClick={() => toggle(key)}
              >
                <span
                  className={`config-sidebar__acc-ico config-sidebar__acc-ico--${tone}`}
                  aria-hidden
                >
                  <Icon size={18} strokeWidth={1.85} />
                </span>
                <span className="config-sidebar__acc-text">
                  <span className="config-sidebar__acc-label">{label}</span>
                  {!expanded && summary ? (
                    <span className="config-sidebar__acc-summary">{summary}</span>
                  ) : null}
                </span>
                <ChevronDown
                  size={18}
                  strokeWidth={2}
                  aria-hidden
                  className={`config-sidebar__acc-chev${expanded ? ' config-sidebar__acc-chev--open' : ''}`}
                />
              </button>
              {expanded ? (
                <ul className="config-sidebar__acc-detail">
                  {items.map((row) => (
                    <li key={row.label}>
                      <span className="config-sidebar__acc-detail-label">{row.label}</span>
                      <span className="config-sidebar__acc-detail-value">{row.value}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="config-sidebar__tip" role="note">
        <span className="config-sidebar__tip-icon" aria-hidden>
          <Lightbulb size={18} strokeWidth={2} />
        </span>
        <div className="config-sidebar__tip-copy">
          <strong className="config-sidebar__tip-title">Dica</strong>
          <p className="config-sidebar__tip-text">
            Mantenha seus parâmetros sempre atualizados para obter propostas mais precisas.
          </p>
        </div>
      </div>
    </aside>
  )
}
