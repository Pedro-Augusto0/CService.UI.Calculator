import { useMemo, useState } from 'react'
import {
  ChevronDown,
  FileBarChart,
  Layers3,
  Mail,
  Newspaper,
  RadioTower,
  Wallet,
} from 'lucide-react'
import { MONITORING_LABELS, type Prices } from '../../domain/prices'
import { MONITORING_SERVICE_KEYS } from '../../domain/types'
import { formatCurrency } from '../../utils/currency'
import './ConfigPricingSidebar.css'

interface ConfigPricingSidebarProps {
  prices: Prices
  precoBaseMensal: number
  pricingSavedAt: number
}

function formatSavedAt(ms: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(ms))
}

export function ConfigPricingSidebar({
  prices,
  precoBaseMensal,
  pricingSavedAt,
}: ConfigPricingSidebarProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    servicos: true,
    broadcast: false,
    relatorios: false,
    additionals: false,
  })

  const serviceStats = useMemo(() => {
    const vals = MONITORING_SERVICE_KEYS.map((k) => prices.servicePrices[k]).filter(
      Number.isFinite,
    )
    if (!vals.length) return { min: 0, max: 0 }
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [prices.servicePrices])
  const totalConfigFields =
    1 +
    2 +
    MONITORING_SERVICE_KEYS.length +
    Object.keys(prices.broadcast.tv).length +
    Object.keys(prices.broadcast.radio).length +
    Object.keys(prices.broadcast.relatorio).length +
    Object.keys(prices.additionals).length
  const summarySections = useMemo(
    () => [
      {
        key: 'servicos',
        label: 'Serviços por tipo',
        icon: Layers3,
        count: MONITORING_SERVICE_KEYS.length,
        items: MONITORING_SERVICE_KEYS.map((k) => ({
          label: MONITORING_LABELS[k],
          value: formatCurrency(prices.servicePrices[k]),
        })),
      },
      {
        key: 'broadcast',
        label: 'Broadcast fixo',
        icon: RadioTower,
        count:
          Object.keys(prices.broadcast.tv).length +
          Object.keys(prices.broadcast.radio).length,
        items: [
          { label: 'TV SP/RJ', value: formatCurrency(prices.broadcast.tv.sp_rj) },
          { label: 'TV Nacional', value: formatCurrency(prices.broadcast.tv.nacional) },
          { label: 'Rádio SP/RJ', value: formatCurrency(prices.broadcast.radio.sp_rj) },
          { label: 'Rádio Nacional', value: formatCurrency(prices.broadcast.radio.nacional) },
        ],
      },
      {
        key: 'relatorios',
        label: 'Relatórios',
        icon: FileBarChart,
        count: Object.keys(prices.broadcast.relatorio).length,
        items: [
          { label: 'Relatório mensal', value: formatCurrency(prices.broadcast.relatorio.mensal) },
          { label: 'Relatório semanal', value: formatCurrency(prices.broadcast.relatorio.semanal) },
        ],
      },
      {
        key: 'additionals',
        label: 'Adicionais e regras',
        icon: Newspaper,
        count: 6,
        items: [
          {
            label: 'Mídias sociais · posts inclusos',
            value: `${prices.additionals.midiasSociaisIncludedPosts}`,
          },
          {
            label: `Passo excedente · ${prices.additionals.midiasSociaisExcessPostsStep} posts`,
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
      },
    ],
    [prices],
  )
  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <aside className="config-summary-panel">
      <div className="config-summary-panel__meta">
        <div className="config-summary-panel__meta-kicker">Última revisão</div>
        <div className="config-summary-panel__meta-time">{formatSavedAt(pricingSavedAt)}</div>
        <div className="config-summary-panel__meta-tags">
          <span className="config-summary-panel__meta-tag">Tabela ativa</span>
          <span className="config-summary-panel__meta-tag config-summary-panel__meta-tag--muted">
            {totalConfigFields} campos
          </span>
        </div>
     
      </div>

      <div className="config-summary-panel__card">
        <div className="config-summary-panel__card-head">
          <h2 className="config-summary-panel__title">Resumo da tabela de preços</h2>
          <p className="config-summary-panel__subtitle">
            Visualização rápida dos principais valores.
          </p>
        </div>

        <ul className="config-summary-panel__kv">
          <li>
            <span>
              <Wallet size={14} strokeWidth={2} aria-hidden />
              Preço base mensal
            </span>
            <strong>{formatCurrency(precoBaseMensal)}</strong>
          </li>
          <li>
            <span>
              <Layers3 size={14} strokeWidth={2} aria-hidden />
              Preço por volume
            </span>
            <strong>{formatCurrency(prices.volumePrice)}</strong>
          </li>
          <li>
            <span>
              <Mail size={14} strokeWidth={2} aria-hidden />
              Newsletter (envio/dia)
            </span>
            <strong>{formatCurrency(prices.destinatarioPrice)}</strong>
          </li>
        </ul>

        <div className="config-summary-panel__acc">
          {summarySections.map(({ key, label, icon: Icon, count, items }) => (
            <div key={key} className={`config-acc${open[key] ? ' config-acc--open' : ''}`}>
              <button
                type="button"
                className="config-acc__head"
                onClick={() => toggle(key)}
                aria-expanded={open[key]}
              >
                <span className="config-acc__head-main">
                  <span className="config-acc__icon" aria-hidden>
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="config-acc__label">{label}</span>
                  <span className="config-acc__count">{count} itens</span>
                  <ChevronDown size={17} aria-hidden strokeWidth={2} className="config-acc__chev" />
                </span>
                {key === 'servicos' ? (
                  <span className="config-acc__sub">
                    mín <strong>{formatCurrency(serviceStats.min)}</strong>
                    {' · '}máx <strong>{formatCurrency(serviceStats.max)}</strong>
                  </span>
                ) : null}
              </button>
              {open[key] ? (
                <div className="config-acc__body">
                  <ul className="config-acc__list">
                    {items.map((item) => (
                      <li key={item.label}>
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
