import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SECTION_KEYS, MONITORING_SERVICE_KEYS } from '../../domain/types'
import { SECTION_LABELS, MONITORING_LABELS } from '../../domain/prices'
import { formatCurrency } from '../../utils/currency'
import { downloadHtmlDocument, proposalFilename } from '../../utils/downloadHtml'
import { buildProposalHtml } from '../../utils/buildProposalHtml'
import { useProposal } from '../../proposal/ProposalProvider'
import './ResumoProposta.css'

interface ResumoPropostaProps {
  onDownload: () => void
}

export function ResumoProposta({ onDownload }: ResumoPropostaProps) {
  const { state, calculation: c, calculationInput } = useProposal()

  const html = buildProposalHtml(calculationInput, c)

  return (
    <div className="page-etapa resumo-page">
      <div className="page-etapa__intro">
        <h1 className="page-etapa__title">Resumo e proposta</h1>
        <p className="page-etapa__lead">
          Confira o pacote contratado antes de gerar o HTML comercial para envio
          ao cliente.
        </p>
      </div>

      <Card className="resumo-page__card">
        <h2 className="resumo-page__h">Escopo do monitoramento</h2>
        <div className="resumo-page__blocks">
          {SECTION_KEYS.map((key) => {
            const sec = state.sections[key]
            const svcs = MONITORING_SERVICE_KEYS.filter(
              (s) => sec.services[s],
            ).map((s) => MONITORING_LABELS[s])
            return (
              <div key={key} className="resumo-page__block">
                <div className="resumo-page__block-title">
                  {SECTION_LABELS[key]}
                </div>
                <div className="resumo-page__kv">
                  <span>Palavras-chave</span>
                  <span>{sec.keywords.length ? sec.keywords.join(', ') : '—'}</span>
                </div>
                <div className="resumo-page__kv">
                  <span>Volume</span>
                  <span>{sec.volume} / mês</span>
                </div>
                <div className="resumo-page__kv">
                  <span>Serviços</span>
                  <span>{svcs.length ? svcs.join(', ') : '—'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="resumo-page__card">
        <h2 className="resumo-page__h">Serviços adicionais e parâmetros</h2>
        <ul className="resumo-page__list">
          <li>
            <strong>Preço base mensal:</strong>{' '}
            {formatCurrency(state.precoBaseMensal)}
          </li>
          <li>
            <strong>Broadcast:</strong>{' '}
            {[
              state.broadcast.tvEnabled && state.broadcast.tvRegion
                ? `TV (${state.broadcast.tvRegion})`
                : null,
              state.broadcast.radioEnabled && state.broadcast.radioRegion
                ? `Rádio (${state.broadcast.radioRegion})`
                : null,
              state.broadcast.relatorioEnabled && state.broadcast.relatorioFreq
                ? `Relatório (${state.broadcast.relatorioFreq})`
                : null,
            ]
              .filter(Boolean)
              .join(' · ') || '—'}
          </li>
          <li>
            <strong>Opcionais:</strong>{' '}
            {[
              state.additionals.midiasSociais ? 'Mídias Sociais' : null,
              state.additionals.alertasWeb ? 'Alertas WebSites' : null,
              state.additionals.api ? 'API' : null,
              state.additionals.stories ? 'Stories' : null,
              state.additionals.destaques ? 'Destaques' : null,
            ]
              .filter(Boolean)
              .join(', ') || '—'}
          </li>
          <li>
            <strong>Envios / destinatários:</strong>{' '}
            {state.operational.enviosDiarios} ×{' '}
            {state.operational.numDestinatarios}
          </li>
          <li>
            <strong>Modificadores:</strong>{' '}
            {[
              state.operational.envioFeriadosFds ? 'Fins de semana (+25%)' : null,
              state.operational.aprovacaoAutomatica ? 'Aprovação automática (−40%)' : null,
            ]
              .filter(Boolean)
              .join(' · ') || '—'}
          </li>
        </ul>
      </Card>

      <div className="resumo-page__success">
        <strong>Tudo pronto!</strong> Sua proposta pode ser gerada em HTML para
        envio por e-mail ou anexo comercial.
      </div>

      <div className="resumo-page__actions">
        <Button variant="secondary" onClick={() => onDownload()}>
          Salvar e gerar proposta
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            downloadHtmlDocument(html, proposalFilename())
          }}
        >
          Baixar HTML agora
        </Button>
      </div>
    </div>
  )
}
