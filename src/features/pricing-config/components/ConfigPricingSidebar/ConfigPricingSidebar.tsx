import { useEffect, useMemo, useState } from 'react'
import {
  CalendarRange,
  Calculator,
  ChevronDown,
  FileBarChart,
  HeartHandshake,
  Layers,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'
import type { ConfigTabId } from '@/features/pricing-config/types'
import {
  BILLING_MODE_LABELS,
  MATTER_SERVICE_SHORT_LABELS,
  REPORT_FREQUENCY_LABELS,
  type Prices,
} from '@/domain/prices'
import { MATTER_SERVICE_KEYS, REPORT_FREQUENCIES } from '@/domain/types'
import { formatCurrency } from '@/utils/currency'
import './ConfigPricingSidebar.css'

interface ConfigPricingSidebarProps {
  prices: Prices
  precoBaseMensal: number
  pricingSavedAt: number
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
    if (focusSection) setOpenKey(focusSection)
  }, [focusSection])

  const matterItems = useMemo(() => {
    return MATTER_SERVICE_KEYS.map((k) => {
      if (k === 'avaliacao') {
        const conf = prices.matterServices.avaliacao
        const tierCount = conf.tiers.length
        return {
          label: MATTER_SERVICE_SHORT_LABELS[k],
          value: `${BILLING_MODE_LABELS[conf.mode]} · ${tierCount} faixa${tierCount === 1 ? '' : 's'}`,
        }
      }
      const conf = prices.matterServices[k]
      const parts: string[] = [BILLING_MODE_LABELS[conf.mode]]
      if (conf.mode === 'fixed' || conf.mode === 'both') {
        parts.push(`F: ${formatCurrency(conf.fixedPrice)}`)
      }
      if (conf.mode === 'variable' || conf.mode === 'both') {
        parts.push(`V: ${formatCurrency(conf.variablePrice)}`)
      }
      return {
        label: MATTER_SERVICE_SHORT_LABELS[k],
        value: parts.join(' · '),
      }
    })
  }, [prices.matterServices])

  const reportItems = useMemo(
    () => [
      ...REPORT_FREQUENCIES.map((f) => ({
        label: `Executivo · ${REPORT_FREQUENCY_LABELS[f]}`,
        value: formatCurrency(prices.reports.executivo.byFrequency[f]),
      })),
      ...REPORT_FREQUENCIES.map((f) => ({
        label: `Estratégico · ${REPORT_FREQUENCY_LABELS[f]}`,
        value: formatCurrency(prices.reports.estrategico.byFrequency[f]),
      })),
      { label: 'BI · Setup', value: formatCurrency(prices.reports.bi.setupPrice) },
      {
        label: 'BI · Manutenção',
        value: formatCurrency(prices.reports.bi.monthlyMaintenance),
      },
    ],
    [prices.reports],
  )

  const additionalsItems = useMemo(() => {
    const a = prices.additionals
    return [
      { label: 'Rádio SP/RJ', value: formatCurrency(a.radio.spRj) },
      { label: 'Rádio Nacional', value: formatCurrency(a.radio.nacional) },
      { label: 'TV SP/RJ', value: formatCurrency(a.tv.spRj) },
      { label: 'TV Nacional', value: formatCurrency(a.tv.nacional) },
      {
        label: 'Mídias sociais',
        value: `${a.midiasSociais.tiers.length} faixa${a.midiasSociais.tiers.length === 1 ? '' : 's'}`,
      },
      {
        label: 'Stories Instagram',
        value: `${a.storiesInstagram.tiers.length} faixa${a.storiesInstagram.tiers.length === 1 ? '' : 's'}`,
      },
      { label: 'Alertas web', value: formatCurrency(a.alertasWebRealtime) },
      { label: 'API CService', value: formatCurrency(a.apiCService) },
      { label: 'Newsletter WhatsApp', value: formatCurrency(a.newsletterWhatsApp) },
      {
        label: 'Newsletter extra',
        value: formatCurrency(a.newsletterExtraEnvio),
      },
      {
        label: 'Destinatários extras',
        value: `${a.destinatariosExtras.tiers.length} faixa${a.destinatariosExtras.tiers.length === 1 ? '' : 's'}`,
      },
      { label: 'Plantão', value: `${a.plantaoPercent}%` },
      {
        label: 'Curadoria manual',
        value: formatCurrency(a.curadoriaAprovacaoManual),
      },
      {
        label: 'Aprovação automática',
        value: `${a.aprovacaoAutomaticaPercent}%`,
      },
    ]
  }, [prices.additionals])

  const outrosItems = useMemo(
    () =>
      prices.validadeOptions.length
        ? prices.validadeOptions.map((d) => ({
            label: `Validade · ${d} dia${d === 1 ? '' : 's'}`,
            value: '',
          }))
        : [{ label: 'Nenhuma opção cadastrada', value: '' }],
    [prices.validadeOptions],
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
      label: 'Preço base',
      summary: formatCurrency(precoBaseMensal),
      Icon: Calculator,
      tone: 'purple',
      items: [
        { label: 'Preço base mensal', value: formatCurrency(precoBaseMensal) },
      ],
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
    {
      key: 'outros',
      tab: 'outros',
      label: 'Outros',
      summary: `${prices.validadeOptions.length} opções de validade`,
      Icon: CalendarRange,
      tone: 'purple',
      items: outrosItems,
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
