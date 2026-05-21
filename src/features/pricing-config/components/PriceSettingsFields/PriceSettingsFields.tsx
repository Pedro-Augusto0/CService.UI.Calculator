import type { ComponentType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Antenna,
  AtSign,
  Bell,
  BookOpenCheck,
  Briefcase,
  Camera,
  ClipboardCheck,
  Cpu,
  FileBarChart,
  FileText,
  Gauge,
  Globe,
  Highlighter,
  Newspaper,
  Percent,
  Radio,
  Send,
  Sparkles,
  Star,
  Tv,
  Users,
} from 'lucide-react'
import { PtDecimalField } from '@/components/ui/PtDecimalField'
import { SelectField } from '@/components/ui/SelectField'
import {
  BILLING_MODE_LABELS,
  MATTER_SERVICE_LABELS,
  REPORT_FREQUENCY_LABELS,
  type AvaliacaoTier,
  type MatterServiceConfig,
  type Prices,
  type RangeTier,
} from '@/domain/prices'
import {
  MATTER_SERVICE_KEYS,
  REPORT_FREQUENCIES,
  type BillingMode,
  type MatterServiceKey,
} from '@/domain/types'
import { TierEditor } from '@/features/pricing-config/components/TierEditor'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import './PriceSettingsFields.css'

const CARD_TONES = ['blue', 'green', 'orange'] as const

const SERVICE_ICONS: Record<MatterServiceKey, LucideIcon> = {
  centimetragem: FileText,
  grifo: Highlighter,
  score: Gauge,
  ia: Sparkles,
  screenshot: Camera,
  avaliacao: ClipboardCheck,
}

const SERVICE_DESCRIPTIONS: Record<MatterServiceKey, string> = {
  centimetragem:
    'Centimetragem ou valoração editorial — preço fixo, por volume ou ambos.',
  grifo:
    'Destaque tipográfico em trechos relevantes — preço fixo, por volume ou ambos.',
  score:
    'Pontuação de relevância da matéria — preço fixo, por volume ou ambos.',
  ia: 'Enriquecimento por IA (relevância, sentimento, contexto) — preço fixo, por volume ou ambos.',
  screenshot:
    'Captura visual da publicação — preço fixo, por volume ou ambos.',
  avaliacao:
    'Classificação customizada — preço por faixa (rótulo, fixo e por volume), com modo fixo, variável ou ambos.',
}

const BILLING_MODE_OPTIONS: BillingMode[] = ['fixed', 'variable', 'both']

type PriceConfigCardIcon = ComponentType<{
  size?: number
  strokeWidth?: number
}>

function PriceConfigCard({
  toneIndex,
  Icon,
  title,
  description,
  children,
  iconToneOverride,
}: {
  toneIndex: number
  Icon: PriceConfigCardIcon
  title: string
  description: string
  children: ReactNode
  /** Quando definido, substitui a rotação azul/verde/laranja (ex.: WhatsApp verde). */
  iconToneOverride?: 'whatsapp'
}) {
  const tone =
    iconToneOverride ??
    CARD_TONES[toneIndex % CARD_TONES.length]
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

function ModeBillingFields({
  idPrefix,
  config,
  onChange,
}: {
  idPrefix: string
  config: MatterServiceConfig
  onChange: (next: MatterServiceConfig) => void
}) {
  const showFixed = config.mode === 'fixed' || config.mode === 'both'
  const showVariable = config.mode === 'variable' || config.mode === 'both'

  return (
    <div className="matter-card__mode-fields matter-card__mode-fields--mode-billing">
      <SelectField
        dense
        id={`${idPrefix}-mode`}
        label="Modo de cobrança"
        value={config.mode}
        onChange={(e) =>
          onChange({ ...config, mode: e.target.value as BillingMode })
        }
      >
        {BILLING_MODE_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {BILLING_MODE_LABELS[m]}
          </option>
        ))}
      </SelectField>
      <div
        className="matter-card__mode-fields__cell"
        style={{ visibility: showFixed ? 'visible' : 'hidden' }}
        aria-hidden={!showFixed}
        inert={!showFixed ? true : undefined}
      >
        <PtDecimalField
          id={`${idPrefix}-fixed`}
          label="Valor fixo (R$)"
          value={config.fixedPrice}
          onCommit={(n) => onChange({ ...config, fixedPrice: n })}
        />
      </div>
      <div
        className="matter-card__mode-fields__cell"
        style={{ visibility: showVariable ? 'visible' : 'hidden' }}
        aria-hidden={!showVariable}
        inert={!showVariable ? true : undefined}
      >
        <PtDecimalField
          id={`${idPrefix}-var`}
          label="Por volume (R$ / notícia)"
          value={config.variablePrice}
          onCommit={(n) => onChange({ ...config, variablePrice: n })}
        />
      </div>
    </div>
  )
}

interface PriceSettingsFieldsProps {
  draft: Prices
  patch: <K extends keyof Prices>(key: K, value: Prices[K]) => void
  section: 'matter' | 'reports' | 'monitoramentos' | 'additionals'
}

function newAvaliacaoTier(): AvaliacaoTier {
  return {
    id: `aval-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    label: 'Nova faixa',
    fixedPrice: 0,
    variablePrice: 0,
  }
}

function newRangeTier(prefix: string): RangeTier {
  return {
    id: `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    label: 'Nova faixa',
    upTo: 0,
    price: 0,
  }
}

export function PriceSettingsFields({
  draft,
  patch,
  section,
}: PriceSettingsFieldsProps) {
  if (section === 'matter') return <MatterSection draft={draft} patch={patch} />
  if (section === 'reports') return <ReportsSection draft={draft} patch={patch} />
  if (section === 'monitoramentos')
    return <MonitoramentosSection draft={draft} patch={patch} />
  return <AdditionalsSection draft={draft} patch={patch} />
}

function MatterSection({
  draft,
  patch,
}: Pick<PriceSettingsFieldsProps, 'draft' | 'patch'>) {
  const matter = draft.matterServices
  let tone = 0

  function updateMatter<K extends Exclude<MatterServiceKey, 'avaliacao'>>(
    key: K,
    next: MatterServiceConfig,
  ) {
    patch('matterServices', {
      ...matter,
      [key]: next,
    })
  }

  function updateAvaliacaoMode(mode: BillingMode) {
    patch('matterServices', {
      ...matter,
      avaliacao: { ...matter.avaliacao, mode },
    })
  }

  function updateAvaliacaoTiers(tiers: AvaliacaoTier[]) {
    patch('matterServices', {
      ...matter,
      avaliacao: { ...matter.avaliacao, tiers },
    })
  }

  return (
    <>
      {MATTER_SERVICE_KEYS.filter((k) => k !== 'avaliacao').map((k) => {
        const Icon = SERVICE_ICONS[k]
        const idx = tone++
        const config = matter[k] as MatterServiceConfig
        return (
          <PriceConfigCard
            key={k}
            toneIndex={idx}
            Icon={Icon}
            title={MATTER_SERVICE_LABELS[k]}
            description={SERVICE_DESCRIPTIONS[k]}
          >
            <ModeBillingFields
              idPrefix={`config-matter-${k}`}
              config={config}
              onChange={(next) => updateMatter(k as Exclude<MatterServiceKey, 'avaliacao'>, next)}
            />
          </PriceConfigCard>
        )
      })}

      <article className="config-base-card config-base-card--stacked config-base-card--with-tiers">
        <div className="config-base-card__lead">
          <div className="config-base-card__icon config-base-card__icon--orange" aria-hidden>
            <Star size={22} strokeWidth={1.85} />
          </div>
          <div className="config-base-card__copy">
            <h3 className="config-base-card__title">
              {MATTER_SERVICE_LABELS.avaliacao}
            </h3>
            <p className="config-base-card__desc">
              {SERVICE_DESCRIPTIONS.avaliacao}
            </p>
          </div>
        </div>
        <div className="config-base-card__field config-base-card__field--full">
          <SelectField
            dense
            id="config-aval-mode"
            label="Modo de cobrança (aplicado a todas as faixas)"
            value={matter.avaliacao.mode}
            onChange={(e) => updateAvaliacaoMode(e.target.value as BillingMode)}
          >
            {BILLING_MODE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {BILLING_MODE_LABELS[m]}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="matter-card__tiers">
          <TierEditor<AvaliacaoTier>
            title=""
            description="Combinações de rótulo, valor fixo e valor por volume que o comercial escolhe na proposta."
            tiers={matter.avaliacao.tiers}
            onChange={updateAvaliacaoTiers}
            createTier={newAvaliacaoTier}
            columns={[
              { key: 'label', label: 'Rótulo', type: 'text' },
              { key: 'fixedPrice', label: 'Valor fixo (R$)', type: 'decimal' },
              {
                key: 'variablePrice',
                label: 'Por volume (R$)',
                type: 'decimal',
              },
            ]}
          />
        </div>
      </article>
    </>
  )
}

function ReportsSection({
  draft,
  patch,
}: Pick<PriceSettingsFieldsProps, 'draft' | 'patch'>) {
  const reports = draft.reports
  let tone = 0

  return (
    <>
      <FrequencyCard
        toneIndex={tone++}
        Icon={FileBarChart}
        title="Relatório Executivo CService (PowerPoint)"
        description="Preço por frequência de entrega. O comercial seleciona a frequência contratada na proposta."
        prices={reports.executivo.byFrequency}
        idPrefix="config-rep-exec"
        onChange={(next) =>
          patch('reports', {
            ...reports,
            executivo: { byFrequency: next },
          })
        }
      />
      <FrequencyCard
        toneIndex={tone++}
        Icon={FileBarChart}
        title="Relatório Estratégico de Mídia (HTML)"
        description="Preço por frequência de entrega. Mesma lógica do relatório executivo, formato HTML."
        prices={reports.estrategico.byFrequency}
        idPrefix="config-rep-estr"
        onChange={(next) =>
          patch('reports', {
            ...reports,
            estrategico: { byFrequency: next },
          })
        }
      />

      <PriceConfigCard
        toneIndex={tone++}
        Icon={BookOpenCheck}
        title="CService BI"
        description="Setup único + manutenção mensal recorrente."
      >
        <div className="matter-card__mode-fields">
          <PtDecimalField
            id="config-bi-setup"
            label="Setup (R$)"
            value={reports.bi.setupPrice}
            onCommit={(n) =>
              patch('reports', {
                ...reports,
                bi: { ...reports.bi, setupPrice: n },
              })
            }
          />
          <PtDecimalField
            id="config-bi-maint"
            label="Manutenção mensal (R$)"
            value={reports.bi.monthlyMaintenance}
            onCommit={(n) =>
              patch('reports', {
                ...reports,
                bi: { ...reports.bi, monthlyMaintenance: n },
              })
            }
          />
        </div>
      </PriceConfigCard>
    </>
  )
}

function FrequencyCard({
  toneIndex,
  Icon,
  title,
  description,
  prices,
  idPrefix,
  onChange,
}: {
  toneIndex: number
  Icon: LucideIcon
  title: string
  description: string
  prices: Record<string, number>
  idPrefix: string
  onChange: (next: Record<string, number>) => void
}) {
  const tone = CARD_TONES[toneIndex % CARD_TONES.length]
  return (
    <article className="config-base-card config-base-card--stacked config-base-card--stacked-fields">
      <div className="config-base-card__lead">
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
      </div>
      <div className="freq-grid">
        {REPORT_FREQUENCIES.map((f) => (
          <PtDecimalField
            key={f}
            id={`${idPrefix}-${f}`}
            label={`${REPORT_FREQUENCY_LABELS[f]} (R$)`}
            value={prices[f] ?? 0}
            onCommit={(n) => onChange({ ...prices, [f]: n })}
          />
        ))}
      </div>
    </article>
  )
}

function MonitoramentosSection({
  draft,
  patch,
}: Pick<PriceSettingsFieldsProps, 'draft' | 'patch'>) {
  const a = draft.additionals
  let tone = 0

  function update<K extends keyof Prices['additionals']>(
    key: K,
    value: Prices['additionals'][K],
  ) {
    patch('additionals', { ...a, [key]: value })
  }

  return (
    <>
      <PriceConfigCard
        toneIndex={tone++}
        Icon={Newspaper}
        title="Monitoramento Impresso"
        description="Valor mensal único. Ative ou desative na proposta."
      >
        <div className="matter-card__mode-fields">
          <PtDecimalField
            id="config-impresso"
            label="Valor (R$)"
            value={a.impresso}
            onCommit={(n) => update('impresso', n)}
          />
        </div>
      </PriceConfigCard>

      <PriceConfigCard
        toneIndex={tone++}
        Icon={Globe}
        title="Monitoramento Web"
        description="Nacional e Internacional. Na proposta cada um tem um interruptor; podem ficar os dois ligados."
      >
        <div className="matter-card__mode-fields">
          <PtDecimalField
            id="config-web-nacional"
            label="Nacional (R$)"
            value={a.web.nacional}
            onCommit={(n) => update('web', { ...a.web, nacional: n })}
          />
          <PtDecimalField
            id="config-web-internacional"
            label="Internacional (R$)"
            value={a.web.internacional}
            onCommit={(n) => update('web', { ...a.web, internacional: n })}
          />
        </div>
      </PriceConfigCard>

      <PriceConfigCard
        toneIndex={tone++}
        Icon={Radio}
        title="Monitoramento Rádio"
        description="SP+RJ e Nacional. As regiões são mutuamente exclusivas na proposta."
      >
        <div className="matter-card__mode-fields">
          <PtDecimalField
            id="config-radio-sprj"
            label="SP + RJ (R$)"
            value={a.radio.spRj}
            onCommit={(n) => update('radio', { ...a.radio, spRj: n })}
          />
          <PtDecimalField
            id="config-radio-nac"
            label="Nacional (R$)"
            value={a.radio.nacional}
            onCommit={(n) => update('radio', { ...a.radio, nacional: n })}
          />
        </div>
      </PriceConfigCard>

      <PriceConfigCard
        toneIndex={tone++}
        Icon={Tv}
        title="Monitoramento TV"
        description="SP+RJ e Nacional. As regiões são mutuamente exclusivas na proposta."
      >
        <div className="matter-card__mode-fields">
          <PtDecimalField
            id="config-tv-sprj"
            label="SP + RJ (R$)"
            value={a.tv.spRj}
            onCommit={(n) => update('tv', { ...a.tv, spRj: n })}
          />
          <PtDecimalField
            id="config-tv-nac"
            label="Nacional (R$)"
            value={a.tv.nacional}
            onCommit={(n) => update('tv', { ...a.tv, nacional: n })}
          />
        </div>
      </PriceConfigCard>

      <article className="config-base-card config-base-card--stacked config-base-card--with-tiers">
        <div className="config-base-card__lead">
          <div className="config-base-card__icon config-base-card__icon--blue" aria-hidden>
            <Antenna size={22} strokeWidth={1.85} />
          </div>
          <div className="config-base-card__copy">
            <h3 className="config-base-card__title">Monitoramento de Mídias Sociais</h3>
            <p className="config-base-card__desc">
              Faixas por quantidade de posts. O comercial escolhe a faixa em combo.
            </p>
          </div>
        </div>
        <div className="matter-card__tiers">
          <TierEditor<RangeTier>
            title=""
            description="Exemplos: até 100 posts, até 250 posts."
            tiers={a.midiasSociais.tiers}
            onChange={(tiers) => update('midiasSociais', { tiers })}
            createTier={() => newRangeTier('ms')}
            columns={[
              { key: 'label', label: 'Rótulo', type: 'text' },
              { key: 'upTo', label: 'Até X posts', type: 'integer' },
              { key: 'price', label: 'Valor (R$)', type: 'decimal' },
            ]}
          />
        </div>
      </article>

      <article className="config-base-card config-base-card--stacked config-base-card--with-tiers">
        <div className="config-base-card__lead">
          <div className="config-base-card__icon config-base-card__icon--instagram" aria-hidden>
            <InstagramIcon size={22} strokeWidth={1.85} />
          </div>
          <div className="config-base-card__copy">
            <h3 className="config-base-card__title">Monitoramento de Instagram Stories</h3>
            <p className="config-base-card__desc">
              Faixas por quantidade de perfis monitorados.
            </p>
          </div>
        </div>
        <div className="matter-card__tiers">
          <TierEditor<RangeTier>
            title=""
            description="Exemplos: até 100 perfis, até 250 perfis."
            tiers={a.storiesInstagram.tiers}
            onChange={(tiers) => update('storiesInstagram', { tiers })}
            createTier={() => newRangeTier('sg')}
            columns={[
              { key: 'label', label: 'Rótulo', type: 'text' },
              { key: 'upTo', label: 'Até X perfis', type: 'integer' },
              { key: 'price', label: 'Valor (R$)', type: 'decimal' },
            ]}
          />
        </div>
      </article>
    </>
  )
}

function AdditionalsSection({
  draft,
  patch,
}: Pick<PriceSettingsFieldsProps, 'draft' | 'patch'>) {
  const a = draft.additionals
  let tone = 0

  function update<K extends keyof Prices['additionals']>(
    key: K,
    value: Prices['additionals'][K],
  ) {
    patch('additionals', { ...a, [key]: value })
  }

  return (
    <>
      <PriceConfigCard
        toneIndex={tone++}
        Icon={Bell}
        title="Alertas Web em Tempo Real"
        description="Cobrança fixa mensal."
      >
        <PtDecimalField
          id="config-alertas-web-realtime"
          label="Valor (R$)"
          value={a.alertasWebRealtime}
          onCommit={(n) => update('alertasWebRealtime', n)}
        />
      </PriceConfigCard>

      <PriceConfigCard
        toneIndex={tone++}
        Icon={Cpu}
        title="Integração via API CService"
        description="Cobrança fixa mensal pela integração."
      >
        <PtDecimalField
          id="config-api-cservice"
          label="Valor (R$)"
          value={a.apiCService}
          onCommit={(n) => update('apiCService', n)}
        />
      </PriceConfigCard>

      <PriceConfigCard
        toneIndex={tone++}
        iconToneOverride="whatsapp"
        Icon={WhatsAppIcon}
        title="Envio de Newsletter via WhatsApp"
        description="Cobrança fixa mensal."
      >
        <PtDecimalField
          id="config-news-wpp"
          label="Valor (R$)"
          value={a.newsletterWhatsApp}
          onCommit={(n) => update('newsletterWhatsApp', n)}
        />
      </PriceConfigCard>

      <PriceConfigCard
        toneIndex={tone++}
        Icon={Send}
        title="Newsletter Adicional"
        description="Valor fixo por envio adicional além do incluso no pacote."
      >
        <PtDecimalField
          id="config-news-extra"
          label="Valor por envio extra (R$)"
          value={a.newsletterExtraEnvio}
          onCommit={(n) => update('newsletterExtraEnvio', n)}
        />
      </PriceConfigCard>
      <PriceConfigCard
        toneIndex={tone++}
        Icon={Briefcase}
        title="Curadoria e Aprovação Manual de Newsletter"
        description="Valor fixo mensal."
      >
        <PtDecimalField
          id="config-curadoria"
          label="Valor (R$)"
          value={a.curadoriaAprovacaoManual}
          onCommit={(n) => update('curadoriaAprovacaoManual', n)}
        />
      </PriceConfigCard>
      <article className="config-base-card config-base-card--stacked config-base-card--with-tiers">
        <div className="config-base-card__lead">
          <div className="config-base-card__icon config-base-card__icon--orange" aria-hidden>
            <Users size={22} strokeWidth={1.85} />
          </div>
          <div className="config-base-card__copy">
            <h3 className="config-base-card__title">Destinatários Adicionais</h3>
            <p className="config-base-card__desc">
              Preço fixo por faixa de destinatários extras (+10, +25, +50, +100).
            </p>
          </div>
        </div>
        <div className="matter-card__tiers">
          <TierEditor<RangeTier>
            title=""
            description="O comercial escolhe a faixa em combo."
            tiers={a.destinatariosExtras.tiers}
            onChange={(tiers) => update('destinatariosExtras', { tiers })}
            createTier={() => newRangeTier('de')}
            columns={[
              { key: 'label', label: 'Rótulo', type: 'text' },
              { key: 'upTo', label: 'Quantidade extra', type: 'integer' },
              { key: 'price', label: 'Valor (R$)', type: 'decimal' },
            ]}
          />
        </div>
      </article>

      <PriceConfigCard
        toneIndex={tone++}
        Icon={Percent}
        title="Plantão Finais de Semana e Feriados"
        description="Percentual configurável aplicado como acréscimo sobre o subtotal."
      >
        <PtDecimalField
          id="config-plantao"
          label="Acréscimo (%)"
          value={a.plantaoPercent}
          onCommit={(n) => update('plantaoPercent', n)}
        />
      </PriceConfigCard>



      <PriceConfigCard
        toneIndex={tone++}
        Icon={AtSign}
        title="Aprovação / Envio Automático"
        description="Percentual de desconto aplicado sobre o total quando o comercial habilita esta opção."
      >
        <PtDecimalField
          id="config-aprov"
          label="Desconto (%)"
          value={a.aprovacaoAutomaticaPercent}
          onCommit={(n) => update('aprovacaoAutomaticaPercent', n)}
        />
      </PriceConfigCard>
    </>
  )
}
