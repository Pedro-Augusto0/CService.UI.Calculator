import { useMemo, useState } from 'react'
import {
  ChevronDown,
  FileBarChart,
  Lightbulb,
  Newspaper,
  RadioTower,
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

  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <aside className="config-summary-panel">
      <div className="config-summary-panel__meta">
        <div className="config-summary-panel__meta-kicker">Última revisão nos preços</div>
        <div className="config-summary-panel__meta-time">{formatSavedAt(pricingSavedAt)}</div>
        <button type="button" className="config-summary-panel__sync">
          Últimas alterações salvas ›
        </button>
      </div>

      <div className="config-summary-panel__card">
        <h2 className="config-summary-panel__title">Resumo da tabela de preços</h2>

        <ul className="config-summary-panel__kv">
          <li>
            <span>Preço base mensal</span>
            <strong>{formatCurrency(precoBaseMensal)}</strong>
          </li>
          <li>
            <span>Preço por volume</span>
            <strong>{formatCurrency(prices.volumePrice)}</strong>
          </li>
          <li>
            <span>Newsletter (envio/dia)</span>
            <strong>{formatCurrency(prices.destinatarioPrice)}</strong>
          </li>
        </ul>

        <div className="config-summary-panel__acc">
          <div className={`config-acc${open.servicos ? ' config-acc--open' : ''}`}>
            <button
              type="button"
              className="config-acc__head"
              onClick={() => toggle('servicos')}
              aria-expanded={open.servicos}
            >
              <span className="config-acc__head-main">
                <span className="config-acc__icon" aria-hidden>
                  <LayersGlyph />
                </span>
                <span className="config-acc__label">Serviços por tipo</span>
                <ChevronDown size={17} aria-hidden strokeWidth={2} className="config-acc__chev" />
              </span>
              <span className="config-acc__sub">
                mín <strong>{formatCurrency(serviceStats.min)}</strong>
                {' · '}máx <strong>{formatCurrency(serviceStats.max)}</strong>
              </span>
            </button>
            {open.servicos ? (
              <div className="config-acc__body">
                <ul className="config-acc__list">
                  {MONITORING_SERVICE_KEYS.map((k) => (
                    <li key={k}>
                      <span>{MONITORING_LABELS[k]}</span>
                      <span>{formatCurrency(prices.servicePrices[k])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className={`config-acc${open.broadcast ? ' config-acc--open' : ''}`}>
            <button
              type="button"
              className="config-acc__head"
              onClick={() => toggle('broadcast')}
              aria-expanded={open.broadcast}
            >
              <span className="config-acc__head-main">
                <span className="config-acc__icon" aria-hidden>
                  <RadioTower size={16} aria-hidden strokeWidth={2} />
                </span>
                <span className="config-acc__label">Broadcast fixo</span>
                <ChevronDown size={17} aria-hidden strokeWidth={2} className="config-acc__chev" />
              </span>
            </button>
            {open.broadcast ? (
              <div className="config-acc__body">
                <ul className="config-acc__list">
                  <li>
                    <span>TV SP/RJ</span>
                    <span>{formatCurrency(prices.broadcast.tv.sp_rj)}</span>
                  </li>
                  <li>
                    <span>TV Nacional</span>
                    <span>{formatCurrency(prices.broadcast.tv.nacional)}</span>
                  </li>
                  <li>
                    <span>Rádio SP/RJ</span>
                    <span>{formatCurrency(prices.broadcast.radio.sp_rj)}</span>
                  </li>
                  <li>
                    <span>Rádio Nacional</span>
                    <span>{formatCurrency(prices.broadcast.radio.nacional)}</span>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>

          <div className={`config-acc${open.relatorios ? ' config-acc--open' : ''}`}>
            <button
              type="button"
              className="config-acc__head"
              onClick={() => toggle('relatorios')}
              aria-expanded={open.relatorios}
            >
              <span className="config-acc__head-main">
                <span className="config-acc__icon" aria-hidden>
                  <FileBarChart size={16} aria-hidden strokeWidth={2} />
                </span>
                <span className="config-acc__label">Relatórios</span>
                <ChevronDown size={17} aria-hidden strokeWidth={2} className="config-acc__chev" />
              </span>
            </button>
            {open.relatorios ? (
              <div className="config-acc__body">
                <ul className="config-acc__list">
                  <li>
                    <span>Relatório mensal</span>
                    <span>{formatCurrency(prices.broadcast.relatorio.mensal)}</span>
                  </li>
                  <li>
                    <span>Relatório semanal</span>
                    <span>{formatCurrency(prices.broadcast.relatorio.semanal)}</span>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>

          <div className={`config-acc${open.additionals ? ' config-acc--open' : ''}`}>
            <button
              type="button"
              className="config-acc__head"
              onClick={() => toggle('additionals')}
              aria-expanded={open.additionals}
            >
              <span className="config-acc__head-main">
                <span className="config-acc__icon" aria-hidden>
                  <Newspaper size={16} aria-hidden strokeWidth={2} />
                </span>
                <span className="config-acc__label">Adicionais e regras</span>
                <ChevronDown size={17} aria-hidden strokeWidth={2} className="config-acc__chev" />
              </span>
            </button>
            {open.additionals ? (
              <div className="config-acc__body">
                <ul className="config-acc__list">
                  <li>
                    <span>Mídias sociais · posts inclusos</span>
                    <span>{prices.additionals.midiasSociaisIncludedPosts}</span>
                  </li>
                  <li>
                    <span>Passo excedente · preço/pass</span>
                    <span>
                      {formatCurrency(prices.additionals.midiasSociaisExcessPricePerStep)}
                    </span>
                  </li>
                  <li>
                    <span>API</span>
                    <span>{formatCurrency(prices.additionals.api)}</span>
                  </li>
                  <li>
                    <span>Stories</span>
                    <span>{formatCurrency(prices.additionals.stories)}</span>
                  </li>
                  <li>
                    <span>Destaques da semana</span>
                    <span>{formatCurrency(prices.additionals.destaques)}</span>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="config-summary-panel__tip">
        <Lightbulb size={18} aria-hidden strokeWidth={2} className="config-summary-panel__tip-icon" />
        <div>
          <strong>Dica:</strong> mantenha a tabela alinhada com a política comercial para evitar
          retrabalho nas propostas em aberto.
        </div>
      </div>
    </aside>
  )
}

function LayersGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="m12 3 8 4-8 4-8-4 8-4Zm0 13 8 4v-9l-2.5 1.25L12 12l-5.5-2.75L4 15v9l8-4Z"
        fill="rgb(148 163 184)"
      />
    </svg>
  )
}
