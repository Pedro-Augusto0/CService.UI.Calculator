import {
  ArrowLeft,
  CircleDashed,
  DollarSign,
  FileText,
  Layers,
  Package,
  Save,
  Send,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/currency'
import { proposalFilename } from '@/utils/downloadHtml'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import './ResumoProposta.css'

interface ResumoPropostaProps {
  onBack: () => void
  onDownload: (filename?: string) => void
  onSaveComplete: () => void
}

function summarizeList(items: string[], max = 2, empty = '—') {
  if (!items.length) return empty
  if (items.length <= max) return items.join(', ')
  return `${items.slice(0, max).join(', ')} +${items.length - max}`
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function splitTags(items: string[], max: number) {
  return {
    visible: items.slice(0, max),
    overflow: Math.max(0, items.length - max),
  }
}

export function ResumoProposta({
  onBack,
  onDownload,
  onSaveComplete,
}: ResumoPropostaProps) {
  const { state, calculation: c, saveCurrentProposal } = useProposal()

  const optionalSelections = [
    state.additionals.midiasSociais ? 'Mídias Sociais' : null,
    state.additionals.alertasWeb ? 'Alertas de Websites' : null,
    state.additionals.api ? 'Acesso API' : null,
    state.additionals.stories ? 'Stories' : null,
    state.additionals.destaques ? 'Destaques da Semana' : null,
  ].filter(Boolean) as string[]

  const monitoringTags = splitTags(c.selectedMonitoringLabels, 7)
  const additionalTags = splitTags(optionalSelections, 4)

  const coverageColumns = [
    {
      label: 'Marcas monitoradas',
      value: summarizeList(state.sections.marcas.keywords, 2, '—'),
    },
    {
      label: 'Concorrentes',
      value: summarizeList(state.sections.concorrentes.keywords, 2, '—'),
    },
    {
      label: 'Setor',
      value: summarizeList(state.sections.setor.keywords, 2, '—'),
    },
    {
      label: 'Volume estimado',
      value: `${formatInteger(c.totalVolume)} notícias / mês`,
    },
    {
      label: 'Palavras-chave',
      value: `${formatInteger(c.totalKeywords)} termo${c.totalKeywords === 1 ? '' : 's'}`,
    },
  ]

  const deliveryColumns = [
    {
      label: 'Frequência de envio',
      value: `${state.operational.enviosDiarios} ${state.operational.enviosDiarios === 1 ? 'envio por dia' : 'envios por dia'}`,
    },
    {
      label: 'Destinatários',
      value: `${formatInteger(state.operational.numDestinatarios)} destinatário${state.operational.numDestinatarios === 1 ? '' : 's'}`,
    },
  ]

  const commercialColumns = [
    {
      label: 'Preço base mensal',
      value: formatCurrency(state.precoBaseMensal),
    },
    { label: 'Contrato', value: 'Mensal' },
    { label: 'Vigência sugerida', value: '12 meses' },
    { label: 'Reajuste', value: 'Anual' },
    { label: 'Condição de pagamento', value: 'A combinar' },
  ]

  const saveMeta = state.lastSavedAt
    ? `Salva localmente em ${new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(state.lastSavedAt)}.`
    : 'Ainda não salva no histórico local.'

  return (
    <div className="page-etapa resumo-page">
    

      <Card
        padded={false}
        className="resumo-page__hero"
        role="region"
        aria-labelledby="resumo-price-heading"
      >
        <div className="resumo-page__hero-inner">
          <p id="resumo-price-heading" className="resumo-page__hero-kicker">
            Investimento mensal estimado
          </p>
          <div className="resumo-page__hero-display">
            <span className="resumo-page__hero-icon" aria-hidden>
              <DollarSign size={18} strokeWidth={2.2} />
            </span>
            <div className="resumo-page__hero-value">
              <p className="resumo-page__hero-amount">{formatCurrency(c.finalPrice)}</p>
              <p className="resumo-page__hero-period">por mês</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="resumo-page__stack">
        <Card padded={false} className="resumo-page__section-card">
          <div className="resumo-page__section-head">
            <span className="resumo-page__section-icon resumo-page__section-icon--blue" aria-hidden>
              <Layers size={18} strokeWidth={2} />
            </span>
            <div className="resumo-page__section-titles">
              <h2 className="resumo-page__section-title">Cobertura do monitoramento</h2>
              <p className="resumo-page__section-sub">
                Marcas monitoradas, concorrentes e setor.
              </p>
            </div>
          </div>
          <div className="resumo-page__info-grid resumo-page__info-grid--coverage">
            {coverageColumns.map((item) => (
              <div key={item.label} className="resumo-page__info-item">
                <span className="resumo-page__info-label">{item.label}</span>
                <strong className="resumo-page__info-value">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card padded={false} className="resumo-page__section-card">
          <div className="resumo-page__section-head">
            <span
              className="resumo-page__section-icon resumo-page__section-icon--violet"
              aria-hidden
            >
              <Package size={18} strokeWidth={2} />
            </span>
            <div className="resumo-page__section-titles">
              <h2 className="resumo-page__section-title">Serviços de monitoramento</h2>
              <p className="resumo-page__section-sub">Serviços aplicados</p>
            </div>
          </div>
          <div className="resumo-page__chip-strip" aria-label="Serviços de monitoramento aplicados">
            {monitoringTags.visible.length ? (
              <>
                {monitoringTags.visible.map((service) => (
                  <span key={service} className="resumo-page__chip">
                    {service}
                  </span>
                ))}
                {monitoringTags.overflow ? (
                  <span className="resumo-page__chip resumo-page__chip--count">
                    +{monitoringTags.overflow}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="resumo-page__empty">Nenhum serviço selecionado</span>
            )}
          </div>
        </Card>

        <Card padded={false} className="resumo-page__section-card">
          <div className="resumo-page__section-head">
            <span className="resumo-page__section-icon resumo-page__section-icon--green" aria-hidden>
              <Sparkles size={18} strokeWidth={2} />
            </span>
            <div className="resumo-page__section-titles">
              <h2 className="resumo-page__section-title">Serviços adicionais</h2>
              <p className="resumo-page__section-sub">Serviços inclusos</p>
            </div>
          </div>
          <div className="resumo-page__chip-strip" aria-label="Serviços adicionais inclusos">
            {additionalTags.visible.length ? (
              <>
                {additionalTags.visible.map((item) => (
                  <span key={item} className="resumo-page__chip resumo-page__chip--muted">
                    {item}
                  </span>
                ))}
                {additionalTags.overflow ? (
                  <span className="resumo-page__chip resumo-page__chip--count">
                    +{additionalTags.overflow}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="resumo-page__empty">Nenhum serviço adicional ativo</span>
            )}
          </div>
        </Card>

        <Card padded={false} className="resumo-page__section-card">
          <div className="resumo-page__section-head">
            <span
              className="resumo-page__section-icon resumo-page__section-icon--orange"
              aria-hidden
            >
              <Send size={18} strokeWidth={2} />
            </span>
            <div className="resumo-page__section-titles">
              <h2 className="resumo-page__section-title">Distribuição e relatórios</h2>
              <p className="resumo-page__section-sub">Configuração de entrega</p>
            </div>
          </div>
          <div className="resumo-page__info-grid resumo-page__info-grid--delivery">
            {deliveryColumns.map((item) => (
              <div key={item.label} className="resumo-page__info-item">
                <span className="resumo-page__info-label">{item.label}</span>
                <strong className="resumo-page__info-value">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card padded={false} className="resumo-page__section-card">
          <div className="resumo-page__section-head">
            <span className="resumo-page__section-icon resumo-page__section-icon--sky" aria-hidden>
              <FileText size={18} strokeWidth={2} />
            </span>
            <div className="resumo-page__section-titles">
              <h2 className="resumo-page__section-title">Parâmetros comerciais</h2>
              <p className="resumo-page__section-sub">Condições padrão desta proposta</p>
            </div>
          </div>
          <div className="resumo-page__info-grid resumo-page__info-grid--commercial">
            {commercialColumns.map((item) => (
              <div key={item.label} className="resumo-page__info-item">
                <span className="resumo-page__info-label">{item.label}</span>
                <strong className="resumo-page__info-value">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <footer className="resumo-page__footer">
        <Button variant="ghost" className="resumo-page__back-button" onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2.1} aria-hidden />
          Voltar
        </Button>

        <div className="resumo-page__actions">
          <div className="resumo-page__actions-buttons">
            <Button
              variant="primary"
              className="resumo-page__action-button"
              onClick={() => {
                saveCurrentProposal()
                onSaveComplete()
              }}
            >
              <Save size={16} strokeWidth={2.2} aria-hidden />
              {state.savedProposalId ? 'Atualizar proposta' : 'Salvar proposta'}
            </Button>
            <Button
              variant="secondary"
              className="resumo-page__action-button"
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
