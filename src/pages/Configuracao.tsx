import type { Dispatch, SetStateAction } from 'react'
import {
  Activity,
  Coins,
  Info,
  Layers3,
  RotateCcw,
  Save,
  Wallet,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { TextField } from '../components/ui/TextField'
import { PriceSettingsFields } from '../components/layout/PriceSettingsFields'
import { DEFAULT_PRICES, type Prices } from '../domain/prices'
import { MONITORING_SERVICE_KEYS } from '../domain/types'
import { useProposal } from '../proposal/ProposalProvider'
import { formatCurrency } from '../utils/currency'
import './Configuracao.css'

interface ConfiguracaoProps {
  draftPrices: Prices
  setDraftPrices: Dispatch<SetStateAction<Prices | null>>
}

export function Configuracao({ draftPrices, setDraftPrices }: ConfiguracaoProps) {
  const { state, dispatch } = useProposal()
  const serviceValues = Object.values(draftPrices.servicePrices)
  const minServicePrice = serviceValues.length ? Math.min(...serviceValues) : 0
  const maxServicePrice = serviceValues.length ? Math.max(...serviceValues) : 0
  const totalConfigFields =
    1 +
    2 +
    MONITORING_SERVICE_KEYS.length +
    Object.keys(draftPrices.broadcast.tv).length +
    Object.keys(draftPrices.broadcast.radio).length +
    Object.keys(draftPrices.broadcast.relatorio).length +
    Object.keys(draftPrices.additionals).length
  const hasPendingPriceChanges = JSON.stringify(draftPrices) !== JSON.stringify(state.prices)
  const isDefaultDraft = JSON.stringify(draftPrices) === JSON.stringify(DEFAULT_PRICES)

  function patch<K extends keyof Prices>(key: K, value: Prices[K]) {
    setDraftPrices((prev) => {
      const base = structuredClone(prev ?? draftPrices)
      return { ...base, [key]: value }
    })
  }

  return (
    <div className="config-page wizard-layout">
      <div className="wizard-content config-page__scroll">
        <section className="config-page__overview" aria-label="Visão geral da configuração">
          <article className="config-page__overview-card">
            <span className="config-page__overview-icon" aria-hidden>
              <Wallet size={18} strokeWidth={2} />
            </span>
            <div className="config-page__overview-body">
              <span className="config-page__overview-label">Preço base mensal</span>
              <strong className="config-page__overview-value">
                {formatCurrency(state.precoBaseMensal)}
              </strong>
              <p className="config-page__overview-text">Aplicado de imediato em todas as novas propostas.</p>
            </div>
          </article>

          <article className="config-page__overview-card">
            <span className="config-page__overview-icon config-page__overview-icon--soft" aria-hidden>
              <Coins size={18} strokeWidth={2} />
            </span>
            <div className="config-page__overview-body">
              <span className="config-page__overview-label">Faixa dos serviços variáveis</span>
              <strong className="config-page__overview-value">
                {formatCurrency(minServicePrice)} - {formatCurrency(maxServicePrice)}
              </strong>
              <p className="config-page__overview-text">
                Referência rápida dos menores e maiores valores unitários da tabela.
              </p>
            </div>
          </article>

          <article className="config-page__overview-card">
            <span className="config-page__overview-icon config-page__overview-icon--slate" aria-hidden>
              <Layers3 size={18} strokeWidth={2} />
            </span>
            <div className="config-page__overview-body">
              <span className="config-page__overview-label">Parâmetros configuráveis</span>
              <strong className="config-page__overview-value">{totalConfigFields} campos</strong>
              <p className="config-page__overview-text">
                Distribuídos entre multiplicadores, serviços, broadcast, relatórios e adicionais.
              </p>
            </div>
          </article>
        </section>

        <nav className="config-page__jump-nav" aria-label="Atalhos da configuração">
          <a className="config-page__jump-link" href="#config-preco-base-card">
            Base mensal
          </a>
          <a className="config-page__jump-link" href="#config-section-metrics">
            Multiplicadores
          </a>
          <a className="config-page__jump-link" href="#config-section-services">
            Serviços
          </a>
          <a className="config-page__jump-link" href="#config-section-broadcast">
            Broadcast
          </a>
          <a className="config-page__jump-link" href="#config-section-reports">
            Relatórios
          </a>
          <a className="config-page__jump-link" href="#config-section-additionals">
            Adicionais
          </a>
        </nav>

        <Card className="config-page__card" id="config-preco-base-card">
          <div className="config-page__card-head">
            <span className="config-page__card-head-icon" aria-hidden>
              <Wallet size={18} strokeWidth={2} />
            </span>
            <div className="config-page__card-head-text">
              <h2 className="config-page__card-title">Preço base mensal</h2>
              <p className="config-page__card-desc">
                Valor fixo somado ao cálculo, após os modificadores percentuais aplicados aos serviços.
              </p>
            </div>
          </div>
          <TextField
            dense
            id="config-preco-base-mensal"
            className="ui-field--inline-max"
            labelIcon={<Coins size={14} strokeWidth={2} aria-hidden />}
            label="Valor base (R$)"
            hint="Incluído no total mensal da proposta."
            type="number"
            min={0}
            step={1}
            value={state.precoBaseMensal || ''}
            onChange={(e) =>
              dispatch({
                type: 'SET_PRECO_BASE_MENSAL',
                value: Number.parseFloat(e.target.value) || 0,
              })
            }
          />
        </Card>

        <div className="config-page__panel price-modal">
          <div className="price-modal__header config-page__price-header">
            <div className="config-page__price-head-main">
              <span className="config-page__price-kicker">Tabela operacional</span>
              <p className="config-page__price-copy">
                Edite os valores unitários e fixos usados pelo cálculo. Este bloco funciona como um
                rascunho até você salvar.
              </p>
            </div>

            <div className="config-page__price-actions">
              <div className="config-page__badges" aria-label="Resumo rápido da tabela">
                <span className="config-page__badge">
                  <Activity size={14} strokeWidth={2} aria-hidden />
                  {totalConfigFields} parâmetros
                </span>
                <span className="config-page__badge config-page__badge--muted">
                  {hasPendingPriceChanges ? 'Rascunho em edição' : 'Sem pendências'}
                </span>
              </div>

              <Button
                variant="ghost"
                type="button"
                className="config-page__restore"
                disabled={isDefaultDraft}
                onClick={() => setDraftPrices(structuredClone(DEFAULT_PRICES))}
              >
                <RotateCcw size={16} strokeWidth={2} aria-hidden />
                Restaurar padrão
              </Button>
            </div>
          </div>

          <PriceSettingsFields draft={draftPrices} patch={patch} />

          <div className="price-modal__footer config-page__price-footer">
            <p className="config-page__save-hint">
              <Info
                size={18}
                strokeWidth={2}
                className="config-page__save-hint-icon"
                aria-hidden
              />
              <span>
                {hasPendingPriceChanges
                  ? 'As alterações da tabela ainda não foram aplicadas. Salve para usar esses valores nas novas propostas.'
                  : 'Tabela em sincronia. Novas alterações feitas abaixo só passam a valer quando você salvar.'}
              </span>
            </p>
            <Button
              variant="primary"
              type="button"
              disabled={!hasPendingPriceChanges}
              onClick={() =>
                dispatch({
                  type: 'SET_PRICES',
                  prices: structuredClone(draftPrices),
                })
              }
            >
              <Save size={18} strokeWidth={2} aria-hidden />
              {hasPendingPriceChanges ? 'Salvar tabela de preços' : 'Tabela sincronizada'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
