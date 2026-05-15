import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronsRight,
  ClipboardCheck,
  Cpu,
  FileBarChart,
  Hash,
  Highlighter,
  Image as ImageIcon,
  Radio,
  Ruler,
  Sparkles,
  Star,
  TrendingUp,
  Tv,
  Type,
} from 'lucide-react'
import { PtDecimalField, PtIntegerField } from '../ui/PtDecimalField'
import { MONITORING_LABELS, type Prices } from '../../domain/prices'
import { MONITORING_SERVICE_KEYS, type MonitoringServiceKey } from '../../domain/types'

const CARD_TONES = ['blue', 'green', 'orange'] as const

const SERVICE_ICONS: Record<MonitoringServiceKey, LucideIcon> = {
  texto: Type,
  centimetragem: Ruler,
  grifo: Highlighter,
  score: Star,
  avaliacao: ClipboardCheck,
  ia: Sparkles,
  screenshot: ImageIcon,
}

const SERVICE_DESCRIPTIONS: Record<MonitoringServiceKey, string> = {
  texto: 'Tarifa unitária aplicada ao monitoramento veiculado em texto corrido.',
  centimetragem: 'Valor por centimetragem ou espaço editorial equivalente.',
  grifo: 'Sobretaxa por menções em grifo ou destaque tipográfico.',
  score: 'Custo por processamento ou exibição do score de relevância.',
  avaliacao: 'Valor da avaliação qualitativa ou parecer sobre publicações.',
  ia: 'Tarifa dos serviços que utilizam analítica ou assistência por IA.',
  screenshot: 'Valor por captura ou preservação visual da menção.',
}

interface PriceSettingsFieldsProps {
  draft: Prices
  patch: <K extends keyof Prices>(key: K, value: Prices[K]) => void
  visibleSections?: PriceSettingsSection[]
}

export type PriceSettingsSection = 'services' | 'broadcast' | 'reports' | 'additionals'

function PriceConfigCard({
  toneIndex,
  Icon,
  title,
  description,
  children,
}: {
  toneIndex: number
  Icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}) {
  const tone = CARD_TONES[toneIndex % CARD_TONES.length]
  return (
    <article className="config-base-card">
      <div
        className={`config-base-card__icon config-base-card__icon--${tone}`}
        aria-hidden
      >
        <Icon size={22} strokeWidth={1.85} />
      </div>
      <div className="config-base-card__copy">
        <h3 className="config-base-card__title">{title}</h3>
        <p className="config-base-card__desc">{description}</p>
      </div>
      <div className="config-base-card__field">{children}</div>
    </article>
  )
}

export function PriceSettingsFields({
  draft,
  patch,
  visibleSections = ['services', 'broadcast', 'reports', 'additionals'],
}: PriceSettingsFieldsProps) {
  const visible = new Set(visibleSections)
  let toneIndex = 0

  return (
    <>
      {visible.has('services')
        ? MONITORING_SERVICE_KEYS.map((k) => {
            const Icon = SERVICE_ICONS[k]
            const idx = toneIndex++
            return (
              <PriceConfigCard
                key={k}
                toneIndex={idx}
                Icon={Icon}
                title={MONITORING_LABELS[k]}
                description={SERVICE_DESCRIPTIONS[k]}
              >
                <PtDecimalField
                  id={`config-service-${k}`}
                  label="Valor (R$)"
                  value={draft.servicePrices[k]}
                  onCommit={(n) =>
                    patch('servicePrices', {
                      ...draft.servicePrices,
                      [k]: n,
                    })
                  }
                />
              </PriceConfigCard>
            )
          })
        : null}

      {visible.has('broadcast') ? (
        <>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Tv}
            title="TV SP+RJ"
            description="Valor fixo mensal para inclusão da cobertura de televisão nas praças São Paulo e Rio de Janeiro."
          >
            <PtDecimalField
              id="config-broadcast-tv-sp-rj"
              label="Valor (R$)"
              value={draft.broadcast.tv.sp_rj}
              onCommit={(n) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  tv: { ...draft.broadcast.tv, sp_rj: n },
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Tv}
            title="TV Nacional"
            description="Preço da distribuição em televisão com alcance em nível nacional."
          >
            <PtDecimalField
              id="config-broadcast-tv-nacional"
              label="Valor (R$)"
              value={draft.broadcast.tv.nacional}
              onCommit={(n) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  tv: { ...draft.broadcast.tv, nacional: n },
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Radio}
            title="Rádio SP+RJ"
            description="Valor para spots ou inserções em rádio nas praças SP e RJ."
          >
            <PtDecimalField
              id="config-broadcast-radio-sp-rj"
              label="Valor (R$)"
              value={draft.broadcast.radio.sp_rj}
              onCommit={(n) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  radio: { ...draft.broadcast.radio, sp_rj: n },
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Radio}
            title="Rádio Nacional"
            description="Preço da cobertura em rádio com abrangência nacional."
          >
            <PtDecimalField
              id="config-broadcast-radio-nacional"
              label="Valor (R$)"
              value={draft.broadcast.radio.nacional}
              onCommit={(n) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  radio: { ...draft.broadcast.radio, nacional: n },
                })
              }
            />
          </PriceConfigCard>
        </>
      ) : null}

      {visible.has('reports') ? (
        <>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={FileBarChart}
            title="Relatório mensal"
            description="Valor do relatório analítico entregue com periodicidade mensal."
          >
            <PtDecimalField
              id="config-report-mensal"
              label="Valor (R$)"
              value={draft.broadcast.relatorio.mensal}
              onCommit={(n) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  relatorio: {
                    ...draft.broadcast.relatorio,
                    mensal: n,
                  },
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={BarChart3}
            title="Relatório semanal"
            description="Valor do relatório analítico com atualização semanal."
          >
            <PtDecimalField
              id="config-report-semanal"
              label="Valor (R$)"
              value={draft.broadcast.relatorio.semanal}
              onCommit={(n) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  relatorio: {
                    ...draft.broadcast.relatorio,
                    semanal: n,
                  },
                })
              }
            />
          </PriceConfigCard>
        </>
      ) : null}

      {visible.has('additionals') ? (
        <>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Hash}
            title="Posts inclusos (mídias sociais)"
            description="Quantidade de posts de redes sociais cobertos pela mensalidade sem cobrança extra."
          >
            <PtIntegerField
              id="config-extra-posts-inclusos"
              label="Quantidade"
              value={draft.additionals.midiasSociaisIncludedPosts}
              min={0}
              onCommit={(n) =>
                patch('additionals', {
                  ...draft.additionals,
                  midiasSociaisIncludedPosts: n,
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={ChevronsRight}
            title="Passo do excedente (posts)"
            description="Tamanho do bloco de posts usado para calcular cobrança quando há excesso."
          >
            <PtIntegerField
              id="config-extra-posts-step"
              label="Quantidade"
              value={draft.additionals.midiasSociaisExcessPostsStep}
              min={1}
              onCommit={(n) =>
                patch('additionals', {
                  ...draft.additionals,
                  midiasSociaisExcessPostsStep: n,
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={TrendingUp}
            title="Preço por passo excedente"
            description="Valor cobrado a cada passo de posts além da franquia inclusa."
          >
            <PtDecimalField
              id="config-extra-excesso-step-price"
              label="Valor (R$)"
              value={draft.additionals.midiasSociaisExcessPricePerStep}
              onCommit={(n) =>
                patch('additionals', {
                  ...draft.additionals,
                  midiasSociaisExcessPricePerStep: n,
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Bell}
            title="Alertas web · envio extra"
            description="Tarifa aplicada por envio adicional nos alertas pela web."
          >
            <PtDecimalField
              id="config-extra-alertas-envio"
              label="Valor (R$)"
              value={draft.additionals.alertasWebPricePerExtraEnvio}
              onCommit={(n) =>
                patch('additionals', {
                  ...draft.additionals,
                  alertasWebPricePerExtraEnvio: n,
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Cpu}
            title="API"
            description="Valor mensal ou unitário para disponibilização do acesso via API."
          >
            <PtDecimalField
              id="config-extra-api"
              label="Valor (R$)"
              value={draft.additionals.api}
              onCommit={(n) =>
                patch('additionals', {
                  ...draft.additionals,
                  api: n,
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={BookOpen}
            title="Stories"
            description="Preço relacionado ao monitoramento ou entrega em formato stories."
          >
            <PtDecimalField
              id="config-extra-stories"
              label="Valor (R$)"
              value={draft.additionals.stories}
              onCommit={(n) =>
                patch('additionals', {
                  ...draft.additionals,
                  stories: n,
                })
              }
            />
          </PriceConfigCard>
          <PriceConfigCard
            toneIndex={toneIndex++}
            Icon={Sparkles}
            title="Destaques da semana"
            description="Valor do add-on de curadoria ou destaque semanal do conteúdo."
          >
            <PtDecimalField
              id="config-extra-destaques"
              label="Valor (R$)"
              value={draft.additionals.destaques}
              onCommit={(n) =>
                patch('additionals', {
                  ...draft.additionals,
                  destaques: n,
                })
              }
            />
          </PriceConfigCard>
        </>
      ) : null}
    </>
  )
}
