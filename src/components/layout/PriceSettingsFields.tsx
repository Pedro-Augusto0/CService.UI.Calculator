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
  Layers,
  Mail,
  Newspaper,
  Radio,
  RadioTower,
  Ruler,
  Sparkles,
  Star,
  TrendingUp,
  Tv,
  Type,
} from 'lucide-react'
import { TextField } from '../ui/TextField'
import { MONITORING_LABELS, type Prices } from '../../domain/prices'
import { MONITORING_SERVICE_KEYS, type MonitoringServiceKey } from '../../domain/types'
import './PriceSettingsModal.css'

function num(v: string): number {
  const n = Number.parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const SERVICE_ICONS: Record<MonitoringServiceKey, LucideIcon> = {
  texto: Type,
  centimetragem: Ruler,
  grifo: Highlighter,
  score: Star,
  avaliacao: ClipboardCheck,
  ia: Sparkles,
  screenshot: ImageIcon,
}

function SectionTitle({
  icon: Icon,
  description,
  children,
}: {
  icon: LucideIcon
  description: string
  children: string
}) {
  return (
    <div className="price-modal__section-intro">
      <h3>
        <span className="price-modal__section-ico" aria-hidden>
          <Icon size={17} strokeWidth={2} />
        </span>
        <span className="price-modal__section-heading-text">{children}</span>
      </h3>
      <p className="price-modal__section-desc">{description}</p>
    </div>
  )
}

function FieldLabelIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon size={14} strokeWidth={2} aria-hidden />
}

interface PriceSettingsFieldsProps {
  draft: Prices
  patch: <K extends keyof Prices>(key: K, value: Prices[K]) => void
  visibleSections?: PriceSettingsSection[]
}

export type PriceSettingsSection =
  | 'metrics'
  | 'distribution'
  | 'services'
  | 'broadcast'
  | 'reports'
  | 'additionals'

export function PriceSettingsFields({
  draft,
  patch,
  visibleSections = [
    'metrics',
    'distribution',
    'services',
    'broadcast',
    'reports',
    'additionals',
  ],
}: PriceSettingsFieldsProps) {
  const visible = new Set(visibleSections)

  return (
    <div className="price-modal__body price-modal__body--config">
      {visible.has('metrics') ? (
        <section
          id="config-section-metrics"
          className="price-modal__section price-modal__section--config price-modal__section--surface"
        >
          <div className="price-config-metrics">
            <div className="price-config-metrics__card">
              <div className="price-config-metrics__ico" aria-hidden>
                <BarChart3 size={20} strokeWidth={2} />
              </div>
              <div className="price-config-metrics__fields">
                <TextField
                  dense
                  id="vp"
                  label="Preço por volume (R$)"
                  hint="Valor multiplicador da soma mensal das notícias monitoradas."
                  value={draft.volumePrice}
                  onChange={(e) => patch('volumePrice', num(e.target.value))}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {visible.has('distribution') ? (
        <section
          id="config-section-distribution"
          className="price-modal__section price-modal__section--config price-modal__section--surface"
        >
          <div className="price-config-metrics">
            <div className="price-config-metrics__card">
              <div className="price-config-metrics__ico price-config-metrics__ico--mail" aria-hidden>
                <Mail size={20} strokeWidth={2} />
              </div>
              <div className="price-config-metrics__fields">
                <TextField
                  dense
                  id="dp"
                  label="Preço destinatário-envio/dia (R$)"
                  hint="Usado quando há envios e destinatários recorrentes (newsletter)."
                  value={draft.destinatarioPrice}
                  onChange={(e) => patch('destinatarioPrice', num(e.target.value))}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {visible.has('services') ? (
        <section
          id="config-section-services"
          className="price-modal__section price-modal__section--config price-modal__section--surface"
        >
          <div className="price-modal__grid">
            {MONITORING_SERVICE_KEYS.map((k) => {
              const Icon = SERVICE_ICONS[k]
              return (
                <TextField
                  key={k}
                  dense
                  labelIcon={<FieldLabelIcon icon={Icon} />}
                  label={MONITORING_LABELS[k]}
                  value={draft.servicePrices[k]}
                  onChange={(e) =>
                    patch('servicePrices', {
                      ...draft.servicePrices,
                      [k]: num(e.target.value),
                    })
                  }
                />
              )
            })}
          </div>
        </section>
      ) : null}

      {visible.has('broadcast') ? (
        <section
          id="config-section-broadcast"
          className="price-modal__section price-modal__section--config price-modal__section--surface"
        >
          <div className="price-modal__grid2">
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Tv} />}
              label="TV SP+RJ"
              value={draft.broadcast.tv.sp_rj}
              onChange={(e) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  tv: { ...draft.broadcast.tv, sp_rj: num(e.target.value) },
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Tv} />}
              label="TV Nacional"
              value={draft.broadcast.tv.nacional}
              onChange={(e) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  tv: {
                    ...draft.broadcast.tv,
                    nacional: num(e.target.value),
                  },
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Radio} />}
              label="Rádio SP+RJ"
              value={draft.broadcast.radio.sp_rj}
              onChange={(e) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  radio: {
                    ...draft.broadcast.radio,
                    sp_rj: num(e.target.value),
                  },
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Radio} />}
              label="Rádio Nacional"
              value={draft.broadcast.radio.nacional}
              onChange={(e) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  radio: {
                    ...draft.broadcast.radio,
                    nacional: num(e.target.value),
                  },
                })
              }
            />
          </div>
        </section>
      ) : null}

      {visible.has('reports') ? (
        <section
          id="config-section-reports"
          className="price-modal__section price-modal__section--config price-modal__section--surface"
        >
          <div className="price-modal__grid2">
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={FileBarChart} />}
              label="Relatório mensal"
              value={draft.broadcast.relatorio.mensal}
              onChange={(e) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  relatorio: {
                    ...draft.broadcast.relatorio,
                    mensal: num(e.target.value),
                  },
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={FileBarChart} />}
              label="Relatório semanal"
              value={draft.broadcast.relatorio.semanal}
              onChange={(e) =>
                patch('broadcast', {
                  ...draft.broadcast,
                  relatorio: {
                    ...draft.broadcast.relatorio,
                    semanal: num(e.target.value),
                  },
                })
              }
            />
          </div>
        </section>
      ) : null}

      {visible.has('additionals') ? (
        <section
          id="config-section-additionals"
          className="price-modal__section price-modal__section--config price-modal__section--surface"
        >
          <div className="price-modal__grid2">
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Hash} />}
              label="Posts inclusos (mídias sociais)"
              value={draft.additionals.midiasSociaisIncludedPosts}
              onChange={(e) =>
                patch('additionals', {
                  ...draft.additionals,
                  midiasSociaisIncludedPosts: Math.max(
                    0,
                    Math.floor(num(e.target.value)),
                  ),
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={ChevronsRight} />}
              label="Passo excedente (posts)"
              value={draft.additionals.midiasSociaisExcessPostsStep}
              onChange={(e) =>
                patch('additionals', {
                  ...draft.additionals,
                  midiasSociaisExcessPostsStep: Math.max(
                    1,
                    Math.floor(num(e.target.value)),
                  ),
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={TrendingUp} />}
              label="Preço por passo excedente"
              value={draft.additionals.midiasSociaisExcessPricePerStep}
              onChange={(e) =>
                patch('additionals', {
                  ...draft.additionals,
                  midiasSociaisExcessPricePerStep: num(e.target.value),
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Bell} />}
              label="Alertas: R$ por envio extra"
              value={draft.additionals.alertasWebPricePerExtraEnvio}
              onChange={(e) =>
                patch('additionals', {
                  ...draft.additionals,
                  alertasWebPricePerExtraEnvio: num(e.target.value),
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Cpu} />}
              label="API"
              value={draft.additionals.api}
              onChange={(e) =>
                patch('additionals', {
                  ...draft.additionals,
                  api: num(e.target.value),
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={BookOpen} />}
              label="Stories"
              value={draft.additionals.stories}
              onChange={(e) =>
                patch('additionals', {
                  ...draft.additionals,
                  stories: num(e.target.value),
                })
              }
            />
            <TextField
              dense
              labelIcon={<FieldLabelIcon icon={Sparkles} />}
              label="Destaques da semana"
              value={draft.additionals.destaques}
              onChange={(e) =>
                patch('additionals', {
                  ...draft.additionals,
                  destaques: num(e.target.value),
                })
              }
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
