import { Check, Download, Lock } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../utils/currency'
import { useProposal } from '../../proposal/ProposalProvider'
import './SummaryPanel.css'

interface SummaryPanelProps {
  onDownload: () => void
}

export function SummaryPanel({ onDownload }: SummaryPanelProps) {
  const { calculation: c, state } = useProposal()

  const lines = [
    {
      label: 'Preço base mensal',
      value: c.breakdownGroups.precoBaseMensal,
      hide: c.breakdownGroups.precoBaseMensal <= 0,
    },
    {
      label: 'Serviços de monitoramento',
      value: c.breakdownGroups.servicosMonitoramento,
      hide: false,
    },
    {
      label: 'Serviços adicionais',
      value: c.breakdownGroups.servicosAdicionais,
      hide: false,
    },
    {
      label: 'Relatório analítico',
      value: c.breakdownGroups.relatorioAnalitico,
      hide: false,
    },
  ].filter((x) => !x.hide)

  const subtotalExModifiers = c.volumeMonetaryBase + c.sumServiceValues

  return (
    <aside className="summary-panel">
      <div className="summary-panel__card">
        <h2 className="summary-panel__title">Resumo da Proposta</h2>

        <div className="summary-panel__stats">
          <div className="summary-panel__stat">
            <span className="summary-panel__stat-label">Palavras-chave</span>
            <span className="summary-panel__stat-number">{c.totalKeywords}</span>
            <span className="summary-panel__stat-unit">termos</span>
          </div>
          <div className="summary-panel__stat">
            <span className="summary-panel__stat-label">Volume estimado</span>
            <span className="summary-panel__stat-number">{c.totalVolume}</span>
            <span className="summary-panel__stat-unit">notícias / mês</span>
          </div>
        </div>

        <div className="summary-panel__divider" aria-hidden />

        <section className="summary-panel__block">
          <h3 className="summary-panel__block-title">Serviços selecionados</h3>
          {c.selectedMonitoringLabels.length ? (
            <ul className="summary-panel__svc-list">
              {c.selectedMonitoringLabels.map((label) => (
                <li key={label} className="summary-panel__svc-item">
                  <span className="summary-panel__svc-check" aria-hidden>
                    <Check strokeWidth={3} size={11} />
                  </span>
                  <span className="summary-panel__svc-label">{label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="summary-panel__empty">
              Nenhum serviço por volume selecionado.
            </p>
          )}
        </section>

        <div className="summary-panel__divider" aria-hidden />

        <section className="summary-panel__block summary-panel__block--values">
          <h3 className="summary-panel__block-title">Resumo de valores</h3>
          <div className="summary-panel__ledger">
            {lines.map((l) => (
              <div key={l.label} className="summary-panel__ledger-row">
                <span className="summary-panel__ledger-label">{l.label}</span>
                <span className="summary-panel__ledger-value">
                  {formatCurrency(l.value)}
                </span>
              </div>
            ))}
            <div className="summary-panel__ledger-row summary-panel__ledger-row--subtotal">
              <span className="summary-panel__ledger-label">Subtotal</span>
              <span className="summary-panel__ledger-value">
                {formatCurrency(subtotalExModifiers)}
              </span>
            </div>
            {state.operational.envioFeriadosFds ? (
              <div className="summary-panel__ledger-row summary-panel__ledger-row--credit">
                <span className="summary-panel__ledger-label">Acréscimos</span>
                <span className="summary-panel__ledger-value">
                  + {formatCurrency(c.valorAcrescimoFimDeSemana)}
                </span>
              </div>
            ) : null}
            {state.operational.aprovacaoAutomatica ? (
              <div className="summary-panel__ledger-row summary-panel__ledger-row--debit">
                <span className="summary-panel__ledger-label">Descontos</span>
                <span className="summary-panel__ledger-value">
                  −{' '}
                  {formatCurrency(Math.abs(c.valorImpactoAprovacaoAutomatica))}
                </span>
              </div>
            ) : null}
          </div>
        </section>

        <div className="summary-panel__final">
          <div className="summary-panel__final-kicker">Preço final</div>
          <div className="summary-panel__final-value">
            {formatCurrency(c.finalPrice)}
          </div>
          <div className="summary-panel__final-hint">por mês</div>
        </div>

        <Button
          variant="primary"
          className="summary-panel__download"
          onClick={onDownload}
        >
          <Download size={17} strokeWidth={2} aria-hidden />
          Salvar e gerar proposta
        </Button>

        <p className="summary-panel__footer-note">
          <Lock size={13} strokeWidth={2} aria-hidden />
          Proposta em HTML pronta para envio
        </p>
      </div>
    </aside>
  )
}
