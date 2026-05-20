import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  FileBarChart,
  HeartHandshake,
  Layers,
  Lightbulb,
  Radar,
  type LucideIcon,
} from 'lucide-react'
import type { ConfigTabId } from '@/features/pricing-config/types'
import { CONFIG_TABS } from '@/pages/price-configuration/lib/priceConfigurationPageLib'
import {
  BILLING_MODE_LABELS,
  MATTER_SERVICE_SHORT_LABELS,
  REPORT_FREQUENCY_LABELS,
  type MatterServiceConfig,
  type Prices,
} from '@/domain/prices'
import { MATTER_SERVICE_KEYS, REPORT_FREQUENCIES } from '@/domain/types'
import { formatCurrency } from '@/utils/currency'
import './ConfigPricingSidebar.css'

interface ConfigPricingSidebarProps {
  prices: Prices
  focusSection?: ConfigTabId
}

type IconTone = 'purple' | 'green' | 'orange' | 'blue'

/** Textos legíveis no resumo (evita abreviações F:/V:). */
function matterServiceSummaryText(conf: MatterServiceConfig): string {
  if (conf.mode === 'fixed') {
    return `Valor fixo: ${formatCurrency(conf.fixedPrice)}`
  }
  if (conf.mode === 'variable') {
    return `Por volume (por notícia): ${formatCurrency(conf.variablePrice)}`
  }
  return [
    `Valor fixo: ${formatCurrency(conf.fixedPrice)}`,
    `Por volume (por notícia): ${formatCurrency(conf.variablePrice)}`,
  ].join('\n')
}

export function ConfigPricingSidebar({
  prices,
  focusSection,
}: ConfigPricingSidebarProps) {
  const [openKey, setOpenKey] = useState<string>(CONFIG_TABS[0].id)

  useEffect(() => {
    if (focusSection) setOpenKey(focusSection)
  }, [focusSection])

  const matterItems = useMemo(() => {
    return MATTER_SERVICE_KEYS.map((k) => {
      if (k === 'avaliacao') {
        const conf = prices.matterServices.avaliacao
        const tierCount = conf.tiers.length
        return {
          label: MATTER_SERVICE_SHORT_LABELS[k],
          value: [
            `Modo de cobrança: ${BILLING_MODE_LABELS[conf.mode]}`,
            `${tierCount} faixa${tierCount === 1 ? '' : 's'} de preço`,
          ].join('\n'),
        }
      }
      const conf = prices.matterServices[k]
      return {
        label: MATTER_SERVICE_SHORT_LABELS[k],
        value: matterServiceSummaryText(conf),
      }
    })
  }, [prices.matterServices])

  const reportItems = useMemo(
    () => [
      ...REPORT_FREQUENCIES.map((f) => ({
        label: `Relatório executivo (PowerPoint) · ${REPORT_FREQUENCY_LABELS[f]}`,
        value: formatCurrency(prices.reports.executivo.byFrequency[f]),
      })),
      ...REPORT_FREQUENCIES.map((f) => ({
        label: `Relatório estratégico (HTML) · ${REPORT_FREQUENCY_LABELS[f]}`,
        value: formatCurrency(prices.reports.estrategico.byFrequency[f]),
      })),
      { label: 'CService BI · taxa de setup', value: formatCurrency(prices.reports.bi.setupPrice) },
      {
        label: 'CService BI · manutenção mensal',
        value: formatCurrency(prices.reports.bi.monthlyMaintenance),
      },
    ],
    [prices.reports],
  )

  const monitoramentosItems = useMemo(() => {
    const a = prices.additionals
    return [
      { label: 'Impresso (mensal)', value: formatCurrency(a.impresso) },
      { label: 'Web · Nacional (mensal)', value: formatCurrency(a.web.nacional) },
      { label: 'Web · Internacional (mensal)', value: formatCurrency(a.web.internacional) },
      { label: 'Rádio SP/RJ', value: formatCurrency(a.radio.spRj) },
      { label: 'Rádio Nacional', value: formatCurrency(a.radio.nacional) },
      { label: 'TV SP/RJ', value: formatCurrency(a.tv.spRj) },
      { label: 'TV Nacional', value: formatCurrency(a.tv.nacional) },
      {
        label: 'Mídias sociais (faixas por posts)',
        value: `${a.midiasSociais.tiers.length} faixa${a.midiasSociais.tiers.length === 1 ? '' : 's'}`,
      },
      {
        label: 'Stories Instagram (faixas por perfis)',
        value: `${a.storiesInstagram.tiers.length} faixa${a.storiesInstagram.tiers.length === 1 ? '' : 's'}`,
      },
    ]
  }, [prices.additionals])

  const additionalsItems = useMemo(() => {
    const a = prices.additionals
    return [
      { label: 'Alertas web', value: formatCurrency(a.alertasWebRealtime) },
      { label: 'API CService', value: formatCurrency(a.apiCService) },
      { label: 'Newsletter WhatsApp', value: formatCurrency(a.newsletterWhatsApp) },
      {
        label: 'Newsletter extra',
        value: formatCurrency(a.newsletterExtraEnvio),
      },
      {
        label: 'Destinatários extras (faixas)',
        value: `${a.destinatariosExtras.tiers.length} faixa${a.destinatariosExtras.tiers.length === 1 ? '' : 's'}`,
      },
      { label: 'Plantão (fds e feriados, % sobre subtotal)', value: `${a.plantaoPercent}%` },
      {
        label: 'Curadoria manual',
        value: formatCurrency(a.curadoriaAprovacaoManual),
      },
      {
        label: 'Aprovação / envio automático (desconto %)',
        value: `${a.aprovacaoAutomaticaPercent}%`,
      },
    ]
  }, [prices.additionals])

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
      key: 'monitoramentos',
      tab: 'monitoramentos',
      label: 'Monitoramentos',
      summary: '7 canais',
      Icon: Radar,
      tone: 'orange',
      items: monitoramentosItems,
    },
    {
      key: 'matter',
      tab: 'matter',
      label: 'Serviços por Matéria',
      summary: `${MATTER_SERVICE_KEYS.length} serviços`,
      Icon: Layers,
      tone: 'green',
      items: matterItems,
    },
    {
      key: 'reports',
      tab: 'reports',
      label: 'Relatórios e BI',
      summary: '2 relatórios + BI',
      Icon: FileBarChart,
      tone: 'blue',
      items: reportItems,
    },
    {
      key: 'additionals',
      tab: 'additionals',
      label: 'Adicionais',
      summary: null,
      Icon: HeartHandshake,
      tone: 'orange',
      items: additionalsItems,
    },
  ]

  return (
    <aside className="config-sidebar">
      <header className="config-sidebar__head">
        <h2 className="config-sidebar__title">Resumo da tabela de preços</h2>
        <p className="config-sidebar__sub">
          Visualização rápida do catálogo da Fase 1.
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
                  {items.map((row, idx) => (
                    <li key={`${row.label}-${idx}`}>
                      <span className="config-sidebar__acc-detail-label">{row.label}</span>
                      {row.value ? (
                        <span className="config-sidebar__acc-detail-value">{row.value}</span>
                      ) : null}
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
            Faixas e modos de cobrança podem ser ajustados sem alterar o código.
          </p>
        </div>
      </div>
    </aside>
  )
}
