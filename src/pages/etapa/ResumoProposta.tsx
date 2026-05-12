import {
  CheckCircle2,
  CircleDashed,
  FileText,
  Layers,
  Package,
  Save,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SECTION_KEYS, MONITORING_SERVICE_KEYS } from '../../domain/types'
import { SECTION_LABELS, MONITORING_LABELS } from '../../domain/prices'
import { formatCurrency } from '../../utils/currency'
import { proposalFilename } from '../../utils/downloadHtml'
import { useProposal } from '../../proposal/ProposalProvider'
import './ResumoProposta.css'

interface ResumoPropostaProps {
  onDownload: (filename?: string) => void
}

function compactList(items: string[], max = 4) {
  if (items.length <= max) return items
  return [...items.slice(0, max), `+${items.length - max} outros`]
}

export function ResumoProposta({ onDownload }: ResumoPropostaProps) {
  const { state, calculation: c, saveCurrentProposal } = useProposal()
  const selectedServices = c.selectedMonitoringLabels.length
  const broadcastSelections = [
    state.broadcast.tvEnabled && state.broadcast.tvRegion
      ? `TV (${state.broadcast.tvRegion})`
      : null,
    state.broadcast.radioEnabled && state.broadcast.radioRegion
      ? `Rádio (${state.broadcast.radioRegion})`
      : null,
    state.broadcast.relatorioEnabled && state.broadcast.relatorioFreq
      ? `Relatório (${state.broadcast.relatorioFreq})`
      : null,
  ].filter(Boolean) as string[]
  const optionalSelections = [
    state.additionals.midiasSociais ? 'Mídias Sociais' : null,
    state.additionals.alertasWeb ? 'Alertas WebSites' : null,
    state.additionals.api ? 'API' : null,
    state.additionals.stories ? 'Stories' : null,
    state.additionals.destaques ? 'Destaques da Semana' : null,
  ].filter(Boolean) as string[]
  const modifierSelections = [
    state.operational.envioFeriadosFds ? 'Fins de semana (+25%)' : null,
    state.operational.aprovacaoAutomatica ? 'Aprovação automática (−40%)' : null,
  ].filter(Boolean) as string[]
  const compactBroadcast = compactList(broadcastSelections, 2)
  const compactOptionals = compactList(optionalSelections, 4)
  const compactModifiers = compactList(modifierSelections, 3)
  const saveMeta = state.lastSavedAt
    ? `Salva localmente em ${new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(state.lastSavedAt)}.`
    : 'Ainda não salva no histórico local.'

  return (
    <div className="page-etapa resumo-page">
      <header className="resumo-page__intro">
        <div className="resumo-page__intro-badge" aria-hidden>
          <Sparkles size={13} strokeWidth={2} />
          Etapa final
        </div>
        <h1 className="resumo-page__title">Resumo e proposta</h1>
        <p className="resumo-page__lead">
          Confira o pacote antes de gerar o documento HTML para envio ao cliente.
          Todos os valores refletem a configuração atual do assistente.
        </p>
      </header>

      <Card
        padded={false}
        className="resumo-page__totals"
        role="region"
        aria-labelledby="resumo-price-heading"
      >
        <div className="resumo-page__totals-inner">
          <div className="resumo-page__totals-price">
            <p id="resumo-price-heading" className="resumo-page__totals-kicker">
              Investimento mensal estimado
            </p>
            <p className="resumo-page__totals-amount">{formatCurrency(c.finalPrice)}</p>
            <p className="resumo-page__totals-hint">
              Valor final após opcionais e modificadores.
            </p>
          </div>
          <ul className="resumo-page__totals-stats" aria-label="Indicadores do escopo">
            <li className="resumo-page__totals-stat">
              <span className="resumo-page__totals-stat-value">{c.totalKeywords}</span>
              <span className="resumo-page__totals-stat-label">palavras-chave</span>
            </li>
            <li className="resumo-page__totals-stat">
              <span className="resumo-page__totals-stat-value">{c.totalVolume}</span>
              <span className="resumo-page__totals-stat-label">notícias / mês</span>
            </li>
            <li className="resumo-page__totals-stat">
              <span className="resumo-page__totals-stat-value">{selectedServices}</span>
              <span className="resumo-page__totals-stat-label">serviços ativos</span>
            </li>
          </ul>
        </div>
      </Card>

      <section className="resumo-page__section" aria-labelledby="escopo-heading">
        <div className="resumo-page__section-head">
          <span className="resumo-page__section-icon" aria-hidden>
            <Layers size={18} strokeWidth={2} />
          </span>
          <div className="resumo-page__section-titles">
            <h2 id="escopo-heading" className="resumo-page__section-title">
              Escopo do monitoramento
            </h2>
            <p className="resumo-page__section-sub">
              Marcas, volumes e tipos de serviço por dimensão do contrato
            </p>
          </div>
        </div>

        <Card padded={false} className="resumo-page__panel">
          <div className="resumo-page__scope-grid">
            {SECTION_KEYS.map((key) => {
              const sec = state.sections[key]
              const svcs = MONITORING_SERVICE_KEYS.filter(
                (s) => sec.services[s],
              ).map((s) => MONITORING_LABELS[s])
              const compactKeywords = compactList(sec.keywords, 5)
              const compactServices = compactList(svcs, 3)
              return (
                <article
                  key={key}
                  className={`resumo-page__scope-card resumo-page__scope-card--${key}`}
                >
                  <header className="resumo-page__scope-head">
                    <h3 className="resumo-page__scope-name">{SECTION_LABELS[key]}</h3>
                    <div className="resumo-page__scope-badges">
                      <span className="resumo-page__pill">{sec.keywords.length} termos</span>
                      <span className="resumo-page__pill resumo-page__pill--volume">
                        {sec.volume} notícias/mês
                      </span>
                    </div>
                  </header>
                  <dl className="resumo-page__dl">
                    <div className="resumo-page__dl-row">
                      <dt>Palavras-chave</dt>
                      <dd>
                        {compactKeywords.length ? (
                          <div className="resumo-page__token-row">
                            {compactKeywords.map((keyword) => (
                              <span key={keyword} className="resumo-page__token">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="resumo-page__empty">Nenhuma definida</span>
                        )}
                      </dd>
                    </div>
                    <div className="resumo-page__dl-row">
                      <dt>Volume</dt>
                      <dd className="resumo-page__dl-em">{sec.volume} / mês</dd>
                    </div>
                    <div className="resumo-page__dl-row resumo-page__dl-row--last">
                      <dt>Serviços</dt>
                      <dd>
                        {compactServices.length ? (
                          <div className="resumo-page__token-row">
                            {compactServices.map((service) => (
                              <span
                                key={service}
                                className="resumo-page__token resumo-page__token--svc"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="resumo-page__empty">Nenhum serviço</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </article>
              )
            })}
          </div>
        </Card>
      </section>

      <section className="resumo-page__section" aria-labelledby="extras-heading">
        <div className="resumo-page__section-head">
          <span className="resumo-page__section-icon" aria-hidden>
            <Package size={18} strokeWidth={2} />
          </span>
          <div className="resumo-page__section-titles">
            <h2 id="extras-heading" className="resumo-page__section-title">
              Adicionais, broadcast e parâmetros
            </h2>
            <p className="resumo-page__section-sub">
              Complementos comerciais, canais de entrega e ajustes de preço aplicados
            </p>
          </div>
        </div>

        <Card padded={false} className="resumo-page__panel">
          <div className="resumo-page__extras">
            <div className="resumo-page__extra">
              <span className="resumo-page__extra-label">Preço base mensal</span>
              <strong className="resumo-page__extra-value resumo-page__extra-value--money">
                {formatCurrency(state.precoBaseMensal)}
              </strong>
              <span className="resumo-page__extra-hint">
                valor fixo recorrente negociado no contrato
              </span>
            </div>

            <div className="resumo-page__extra">
              <span className="resumo-page__extra-label">Distribuição (envios × destinatários)</span>
              <strong className="resumo-page__extra-value">
                {state.operational.enviosDiarios} envios × {state.operational.numDestinatarios}{' '}
                destinatários
              </strong>
              <span className="resumo-page__extra-hint">capacidade operacional declarada</span>
            </div>

            <div className="resumo-page__extra">
              <span className="resumo-page__extra-label">
                Broadcast
                <span className="resumo-page__extra-count">
                  {broadcastSelections.length
                    ? `${broadcastSelections.length} ativo(s)`
                    : 'nenhum'}
                </span>
              </span>
              <div className="resumo-page__tag-strip">
                {compactBroadcast.length ? (
                  compactBroadcast.map((item) => (
                    <span key={item} className="resumo-page__chip">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="resumo-page__empty">Nenhum canal selecionado</span>
                )}
              </div>
            </div>

            <div className="resumo-page__extra">
              <span className="resumo-page__extra-label">
                Opcionais
                <span className="resumo-page__extra-count">
                  {optionalSelections.length
                    ? `${optionalSelections.length} selecionado(s)`
                    : 'nenhum'}
                </span>
              </span>
              <div className="resumo-page__tag-strip">
                {compactOptionals.length ? (
                  compactOptionals.map((item) => (
                    <span key={item} className="resumo-page__chip resumo-page__chip--muted">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="resumo-page__empty">Nenhum opcional ativo</span>
                )}
              </div>
            </div>

            <div className="resumo-page__extra resumo-page__extra--span">
              <span className="resumo-page__extra-label">Modificadores comerciais</span>
              <div className="resumo-page__tag-strip">
                {compactModifiers.length ? (
                  compactModifiers.map((item) => (
                    <span key={item} className="resumo-page__chip resumo-page__chip--accent">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="resumo-page__empty">Nenhum modificador ativo nesta proposta</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <footer className="resumo-page__footer">
        <div className="resumo-page__ready">
          <span className="resumo-page__ready-icon" aria-hidden>
            <CheckCircle2 size={20} strokeWidth={2} />
          </span>
          <div className="resumo-page__ready-text">
            <strong>Pronto para envio ao cliente.</strong>{' '}
            Revise os blocos acima e gere o arquivo HTML quando estiver conforme o combinado com o
            cliente.
          </div>
        </div>

        <div className="resumo-page__actions">
          <div className="resumo-page__actions-buttons">
            <Button
              variant="primary"
              onClick={() => {
                const saved = saveCurrentProposal()
                onDownload(
                  proposalFilename(
                    saved.state.meta.clientName,
                    saved.proposalNumber,
                  ),
                )
              }}
            >
              <Save size={16} strokeWidth={2.2} aria-hidden />
              {state.savedProposalId ? 'Atualizar e gerar proposta' : 'Salvar e gerar proposta'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onDownload(proposalFilename(state.meta.clientName))}
            >
              <FileText size={16} strokeWidth={2.2} aria-hidden />
              Baixar HTML agora
            </Button>
          </div>
          <p className="resumo-page__actions-meta">
            <CircleDashed size={14} aria-hidden />
            {saveMeta}
          </p>
        </div>
      </footer>
    </div>
  )
}
