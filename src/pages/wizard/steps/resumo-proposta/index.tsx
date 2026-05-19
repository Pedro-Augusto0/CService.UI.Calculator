import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  CircleDashed,
  FileBarChart,
  FileText,
  Layers,
  Package,
  Percent,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { effectiveMode } from '@/domain/calculations'
import { MATTER_SERVICE_LABELS, SECTION_LABELS } from '@/domain/prices'
import { MATTER_SERVICE_KEYS, SECTION_KEYS } from '@/domain/types'
import type { MatterServiceKey } from '@/domain/types'
import { formatCurrency } from '@/utils/currency'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import { buildAdditionalsRows, buildReportRows } from './resumoTables'
import './ResumoProposta.css'

interface ResumoPropostaProps {
  onBack: () => void
  onDownload: (filename?: string) => void
  onSaveComplete: () => void
  onOpenSaveTemplate: () => void
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function matterServiceSelected(
  sections: ReturnType<typeof useProposal>['state']['sections'],
  key: MatterServiceKey,
): boolean {
  return SECTION_KEYS.some((sk) => sections[sk].services[key])
}

function setorResumoLine(keywords: string[]): string {
  if (!keywords.length) return '—'
  const joined = keywords.join(', ')
  return joined.length > 48 ? `${joined.slice(0, 46)}…` : joined
}

type DetailSectionKey = 'servicos' | 'relatorios' | 'adicionais' | 'ajustes' | 'parametros'

function ResumoCollapseSection({
  title,
  subtitle,
  icon,
  iconClassName,
  open,
  onToggle,
  children,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  iconClassName: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <Card padded={false} className="resumo-page__section-card resumo-page__collapse-card">
      <button
        type="button"
        className="resumo-page__collapse-trigger"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className={`resumo-page__section-icon ${iconClassName}`} aria-hidden>
          {icon}
        </span>
        <span className="resumo-page__collapse-titles">
          <span className="resumo-page__section-title">{title}</span>
          <span className="resumo-page__section-sub">{subtitle}</span>
        </span>
        <ChevronDown
          size={22}
          strokeWidth={2}
          className={`resumo-page__collapse-chevron ${open ? 'resumo-page__collapse-chevron--open' : ''}`}
          aria-hidden
        />
      </button>
      {open ? <div className="resumo-page__collapse-body">{children}</div> : null}
    </Card>
  )
}

export function ResumoProposta({
  onBack,
  onDownload: _onDownload,
  onSaveComplete: _onSaveComplete,
  onOpenSaveTemplate: _onOpenSaveTemplate,
}: ResumoPropostaProps) {
  const { state, dispatch, calculation: c } = useProposal()

  const [coberturaDetalheOpen, setCoberturaDetalheOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState<Record<DetailSectionKey, boolean>>({
    servicos: true,
    relatorios: true,
    adicionais: true,
    ajustes: true,
    parametros: true,
  })
  const [stripPicker, setStripPicker] = useState<null | 'billing' | 'validade'>(null)

  function toggleDetail(key: DetailSectionKey) {
    setDetailOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const reportRows = useMemo(
    () => buildReportRows(state.reports, state.prices.reports),
    [state.reports, state.prices.reports],
  )

  const additionalRows = useMemo(
    () => buildAdditionalsRows(state.additionals, state.prices.additionals),
    [state.additionals, state.prices.additionals],
  )

  const matterRows = useMemo(() => {
    const vol = c.totalVolume
    const prices = state.prices
    return MATTER_SERVICE_KEYS.filter((k) =>
      matterServiceSelected(state.sections, k),
    ).map((k) => {
      const total = c.matterServiceValues[k]
      if (k === 'avaliacao') {
        const conf = prices.matterServices.avaliacao
        const tier =
          conf.tiers.find((t) => t.id === state.avaliacaoTierId) ?? conf.tiers[0]
        const mode = effectiveMode(conf.mode, state.globalBillingMode)
        return {
          key: k,
          service: MATTER_SERVICE_LABELS[k],
          detail: tier?.label ?? '—',
          billingMode: mode === 'fixed' ? 'Fixo' : 'Variável',
          volumeDisplay: mode === 'fixed' ? '—' : formatInteger(vol),
          unitDisplay:
            mode === 'fixed'
              ? `${formatCurrency(tier?.fixedPrice ?? 0)} / mês`
              : `${formatCurrency(tier?.variablePrice ?? 0)} / notícia`,
          total,
        }
      }
      const conf = prices.matterServices[k]
      const mode = effectiveMode(conf.mode, state.globalBillingMode)
      return {
        key: k,
        service: MATTER_SERVICE_LABELS[k],
        detail: '—',
        billingMode: mode === 'fixed' ? 'Fixo' : 'Variável',
        volumeDisplay: mode === 'fixed' ? '—' : formatInteger(vol),
        unitDisplay:
          mode === 'fixed'
            ? `${formatCurrency(conf.fixedPrice)} / mês`
            : `${formatCurrency(conf.variablePrice)} / notícia`,
        total,
      }
    })
  }, [state.sections, state.prices, state.globalBillingMode, state.avaliacaoTierId, c])

  const coverageBlocks = SECTION_KEYS.map((sk) => ({
    key: sk,
    label: SECTION_LABELS[sk],
    keywords: state.sections[sk].keywords,
    volume: state.sections[sk].volume,
  }))

  const marcasN = state.sections.marcas.keywords.length
  const concN = state.sections.concorrentes.keywords.length
  const setorTxt = setorResumoLine(state.sections.setor.keywords)

  const commercialColumns = [
    {
      label: 'Preço base mensal',
      value: formatCurrency(state.precoBaseMensal),
    },
    {
      label: 'Modo de cobrança',
      value: state.globalBillingMode === 'fixed' ? 'Fixo' : 'Variável',
    },
    {
      label: 'Validade',
      value: `${state.validadeDias} dia${state.validadeDias === 1 ? '' : 's'}`,
    },
    { label: 'Investimento mensal', value: formatCurrency(c.finalPrice) },
    { label: 'Contrato', value: 'Mensal' },
  ]

  const saveMeta = state.lastSavedAt
    ? `Salva localmente em ${new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(state.lastSavedAt)}.`
    : 'Ainda não salva no histórico local.'

  const modoLabel = state.globalBillingMode === 'fixed' ? 'Fixo' : 'Variável'
  const validadeLabel = `${state.validadeDias} dia${state.validadeDias === 1 ? '' : 's'}`

  return (
    <div className="page-etapa resumo-page">
      <Card padded={false} className="resumo-page__strip-card">
        <div className="resumo-page__strip">
          <div className="resumo-page__strip-invest" aria-labelledby="resumo-strip-price-label">
            <span className="resumo-page__strip-spark" aria-hidden>
              <Sparkles size={20} strokeWidth={2.2} />
            </span>
            <div>
              <p id="resumo-strip-price-label" className="resumo-page__strip-kicker">
                Investimento mensal estimado
              </p>
              <p className="resumo-page__strip-amount">{formatCurrency(c.finalPrice)}</p>
              <p className="resumo-page__strip-period">por mês</p>
            </div>
          </div>
          <div className="resumo-page__strip-metric">
            <p className="resumo-page__strip-kicker">Modo de cobrança</p>
            {stripPicker === 'billing' ? (
              <select
                className="resumo-page__strip-select"
                aria-label="Modo de cobrança"
                autoComplete="off"
                autoFocus
                value={state.globalBillingMode}
                onChange={(e) => {
                  const mode = e.target.value === 'fixed' ? 'fixed' : 'variable'
                  dispatch({ type: 'SET_GLOBAL_BILLING_MODE', mode })
                  setStripPicker(null)
                }}
                onBlur={() => setStripPicker(null)}
              >
                <option value="fixed">Fixo</option>
                <option value="variable">Variável</option>
              </select>
            ) : (
              <button
                type="button"
                className="resumo-page__strip-value resumo-page__strip-value--editable"
                onClick={() => setStripPicker('billing')}
              >
                {modoLabel}

                <ChevronDown
                  size={18}
                  strokeWidth={2}
                  className={`resumo-page__coverage-chevron ${coberturaDetalheOpen ? 'resumo-page__coverage-chevron--up' : ''}`}
                  aria-hidden
                />
              </button>
            )}
          </div>
          <div className="resumo-page__strip-metric">
            <p className="resumo-page__strip-kicker">Validade da proposta</p>
            {stripPicker === 'validade' ? (
              <select
                className="resumo-page__strip-select"
                aria-label="Validade da proposta"
                autoComplete="off"
                autoFocus
                value={state.validadeDias}
                onChange={(e) => {
                  dispatch({
                    type: 'SET_VALIDADE_DIAS',
                    dias: Number.parseInt(e.target.value, 10) || 0,
                  })
                  setStripPicker(null)
                }}
                onBlur={() => setStripPicker(null)}
              >
                {state.prices.validadeOptions.map((dias) => (
                  <option key={dias} value={dias}>
                    {dias} dia{dias === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                className="resumo-page__strip-value resumo-page__strip-value--editable"
                onClick={() => setStripPicker('validade')}
              >
                {validadeLabel}

                <ChevronDown
                  size={18}
                  strokeWidth={2}
                  className={`resumo-page__coverage-chevron ${coberturaDetalheOpen ? 'resumo-page__coverage-chevron--up' : ''}`}
                  aria-hidden
                />
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card padded={false} className="resumo-page__section-card resumo-page__coverage-card">
        <div className="resumo-page__coverage-row">
          <div className="resumo-page__coverage-intro">
            <span className="resumo-page__section-icon resumo-page__section-icon--blue" aria-hidden>
              <Layers size={18} strokeWidth={2} />
            </span>
            <div>
              <h2 className="resumo-page__coverage-title">Cobertura do monitoramento</h2>
              <p className="resumo-page__coverage-desc">
                Marcas, concorrentes e setor incluídos no escopo.
              </p>
            </div>
          </div>
          <div className="resumo-page__coverage-metrics" aria-label="Resumo por escopo">
            <div className="resumo-page__coverage-pill">
              <div className="resumo-page__coverage-pill-top">
                <span className="resumo-page__dot resumo-page__dot--blue" aria-hidden />
                <span className="resumo-page__coverage-label">Marcas</span>
              </div>
              <strong className="resumo-page__coverage-strong">{marcasN}</strong>
            </div>
            <div className="resumo-page__coverage-pill">
              <div className="resumo-page__coverage-pill-top">
                <span className="resumo-page__dot resumo-page__dot--orange" aria-hidden />
                <span className="resumo-page__coverage-label">Concorrentes</span>
              </div>
              <strong className="resumo-page__coverage-strong">{concN}</strong>
            </div>
            <div className="resumo-page__coverage-pill resumo-page__coverage-pill--grow">
              <div className="resumo-page__coverage-pill-top">
                <span className="resumo-page__dot resumo-page__dot--violet" aria-hidden />
                <span className="resumo-page__coverage-label">Setor</span>
              </div>
              <strong className="resumo-page__coverage-strong resumo-page__coverage-strong--text">
                {setorTxt}
              </strong>
            </div>
          </div>
          <button
            type="button"
            className="resumo-page__coverage-terms-toggle"
            onClick={() => setCoberturaDetalheOpen((v) => !v)}
            aria-expanded={coberturaDetalheOpen}
          >
            <span className="resumo-page__coverage-terms-value">
              {formatInteger(c.totalKeywords)} termo{c.totalKeywords === 1 ? '' : 's'}
            </span>
            <ChevronDown
              size={18}
              strokeWidth={2}
              className={`resumo-page__coverage-chevron ${coberturaDetalheOpen ? 'resumo-page__coverage-chevron--up' : ''}`}
              aria-hidden
            />
          </button>
        </div>
        {coberturaDetalheOpen ? (
          <div className="resumo-page__coverage-detail">
            <div className="resumo-page__coverage-table-wrap">
              <table className="resumo-page__data-table">
                <thead>
                  <tr>
                    <th scope="col">Escopo</th>
                    <th scope="col">Palavras-chave</th>
                    <th scope="col" className="resumo-page__col-num">
                      Volume estimado (notícias / mês)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coverageBlocks.map((row) => (
                    <tr key={row.key}>
                      <td>{row.label}</td>
                      <td className="resumo-page__cell-keywords">
                        {row.keywords.length ? row.keywords.join(', ') : '—'}
                      </td>
                      <td className="resumo-page__col-num">
                        {row.volume > 0 ? formatInteger(row.volume) : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="resumo-page__data-table-foot">
                    <td colSpan={2}>
                      <strong>Totais consolidados</strong>
                    </td>
                    <td className="resumo-page__col-num">
                      <strong>{formatInteger(c.totalVolume)}</strong> notícias / mês ·{' '}
                      <strong>{formatInteger(c.totalKeywords)}</strong> termo
                      {c.totalKeywords === 1 ? '' : 's'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="resumo-page__stack">
        <ResumoCollapseSection
          title="Serviços por matéria"
          subtitle="Serviços ativos, modo de precificação e totais mensais."
          icon={<Package size={18} strokeWidth={2} />}
          iconClassName="resumo-page__section-icon--violet"
          open={detailOpen.servicos}
          onToggle={() => toggleDetail('servicos')}
        >
          <div className="resumo-page__table-scroll">
            <table className="resumo-page__data-table">
              <thead>
                <tr>
                  <th scope="col">Serviço</th>
                  <th scope="col">Detalhe</th>
                  <th scope="col">Modo na proposta</th>
                  <th scope="col" className="resumo-page__col-num">
                    Volume (notícias)
                  </th>
                  <th scope="col" className="resumo-page__col-num">
                    Preço unitário
                  </th>
                  <th scope="col" className="resumo-page__col-num">
                    Total mensal
                  </th>
                </tr>
              </thead>
              <tbody>
                {matterRows.length ? (
                  matterRows.map((row) => (
                    <tr key={row.key}>
                      <td>{row.service}</td>
                      <td className="resumo-page__cell-muted">{row.detail}</td>
                      <td>{row.billingMode}</td>
                      <td className="resumo-page__col-num">{row.volumeDisplay}</td>
                      <td className="resumo-page__col-num resumo-page__cell-nowrap">
                        {row.unitDisplay}
                      </td>
                      <td className="resumo-page__col-num">
                        <strong>{formatCurrency(row.total)}</strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="resumo-page__table-empty">
                      Nenhum serviço por matéria selecionado.
                    </td>
                  </tr>
                )}
                <tr className="resumo-page__data-table-foot">
                  <td colSpan={5}>
                    <strong>Subtotal serviços por matéria</strong>
                  </td>
                  <td className="resumo-page__col-num">
                    <strong>{formatCurrency(c.matterServicesTotal)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ResumoCollapseSection>

        <ResumoCollapseSection
          title="Relatórios e BI"
          subtitle="Valores conforme catálogo configurado."
          icon={<FileBarChart size={18} strokeWidth={2} />}
          iconClassName="resumo-page__section-icon--green"
          open={detailOpen.relatorios}
          onToggle={() => toggleDetail('relatorios')}
        >
          <div className="resumo-page__table-scroll">
            <table className="resumo-page__data-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Descrição</th>
                  <th scope="col" className="resumo-page__col-num">
                    Valor mensal na proposta
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportRows.length ? (
                  reportRows.map((row) => (
                    <tr key={row.key}>
                      <td>{row.label}</td>
                      <td className="resumo-page__cell-muted">{row.detail}</td>
                      <td className="resumo-page__col-num">
                        <strong>{formatCurrency(row.value)}</strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="resumo-page__table-empty">
                      Nenhum relatório ou BI selecionado.
                    </td>
                  </tr>
                )}
                <tr className="resumo-page__data-table-foot">
                  <td colSpan={2}>
                    <strong>Subtotal relatórios e BI</strong>
                  </td>
                  <td className="resumo-page__col-num">
                    <strong>{formatCurrency(c.reportsTotal)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ResumoCollapseSection>

        <ResumoCollapseSection
          title="Serviços adicionais"
          subtitle="Broadcast, API, newsletters e demais itens cobrados separadamente."
          icon={<Sparkles size={18} strokeWidth={2} />}
          iconClassName="resumo-page__section-icon--orange"
          open={detailOpen.adicionais}
          onToggle={() => toggleDetail('adicionais')}
        >
          <div className="resumo-page__table-scroll">
            <table className="resumo-page__data-table">
              <thead>
                <tr>
                  <th scope="col">Serviço</th>
                  <th scope="col">Detalhe</th>
                  <th scope="col" className="resumo-page__col-num">
                    Valor mensal na proposta
                  </th>
                </tr>
              </thead>
              <tbody>
                {additionalRows.length ? (
                  additionalRows.map((row) => (
                    <tr key={row.key}>
                      <td>{row.label}</td>
                      <td className="resumo-page__cell-muted">{row.detail}</td>
                      <td className="resumo-page__col-num">
                        <strong>{formatCurrency(row.value)}</strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="resumo-page__table-empty">
                      Nenhum serviço adicional ativo.
                    </td>
                  </tr>
                )}
                <tr className="resumo-page__data-table-foot">
                  <td colSpan={2}>
                    <strong>Subtotal serviços adicionais</strong>
                  </td>
                  <td className="resumo-page__col-num">
                    <strong>{formatCurrency(c.additionalsTotal)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ResumoCollapseSection>

        <ResumoCollapseSection
          title="Ajustes e totalização"
          subtitle="Subtotal variável, modificadores percentuais e preço base garantido."
          icon={<Percent size={18} strokeWidth={2} />}
          iconClassName="resumo-page__section-icon--sky"
          open={detailOpen.ajustes}
          onToggle={() => toggleDetail('ajustes')}
        >
          <div className="resumo-page__breakdown">
            <div className="resumo-page__bd-row">
              <span>Subtotal (serviços + relatórios + adicionais)</span>
              <strong>{formatCurrency(c.subtotalBeforeModifiers)}</strong>
            </div>
            {c.valorAcrescimoPlantao > 0 ? (
              <div className="resumo-page__bd-row resumo-page__bd-row--credit">
                <span>Plantão fins de semana / feriados (+{c.plantaoPercent}%)</span>
                <strong>+ {formatCurrency(c.valorAcrescimoPlantao)}</strong>
              </div>
            ) : null}
            {c.valorDescontoAprovacaoAutomatica < 0 ? (
              <div className="resumo-page__bd-row resumo-page__bd-row--debit">
                <span>Aprovação automática (−{c.aprovacaoAutomaticaPercent}%)</span>
                <strong>
                  − {formatCurrency(Math.abs(c.valorDescontoAprovacaoAutomatica))}
                </strong>
              </div>
            ) : null}
            <div className="resumo-page__bd-row">
              <span>Total após modificadores (antes do preço base)</span>
              <strong>
                {formatCurrency(
                  c.subtotalBeforeModifiers +
                  c.valorAcrescimoPlantao +
                  c.valorDescontoAprovacaoAutomatica,
                )}
              </strong>
            </div>
            <div className="resumo-page__bd-row resumo-page__bd-row--emphasis">
              <span>Preço base mensal (pacote)</span>
              <strong>{formatCurrency(state.precoBaseMensal)}</strong>
            </div>
            <div className="resumo-page__bd-row resumo-page__bd-row--final">
              <span>Investimento mensal final</span>
              <strong>{formatCurrency(c.finalPrice)}</strong>
            </div>
          </div>
        </ResumoCollapseSection>

        <ResumoCollapseSection
          title="Parâmetros comerciais"
          subtitle="Condições desta proposta"
          icon={<FileText size={18} strokeWidth={2} />}
          iconClassName="resumo-page__section-icon--blue"
          open={detailOpen.parametros}
          onToggle={() => toggleDetail('parametros')}
        >
          <div className="resumo-page__info-grid resumo-page__info-grid--commercial">
            {commercialColumns.map((item) => (
              <div key={item.label} className="resumo-page__info-item">
                <span className="resumo-page__info-label">{item.label}</span>
                <strong className="resumo-page__info-value">{item.value}</strong>
              </div>
            ))}
          </div>
        </ResumoCollapseSection>
      </div>

      <footer className="resumo-page__footer resumo-page__footer--slim">
        <Button variant="ghost" className="resumo-page__back-button" onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2.1} aria-hidden />
          Voltar
        </Button>
        <p className="resumo-page__actions-meta">
          <CircleDashed size={14} aria-hidden />
          {saveMeta}
        </p>
      </footer>
    </div>
  )
}
