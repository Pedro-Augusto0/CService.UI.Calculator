import type {
  CalculationInput,
  CalculationResult,
  ProposalMeta,
  SectionKey,
} from '../domain/types'
import { MONITORING_LABELS, SECTION_LABELS } from '../domain/prices'
import { MONITORING_SERVICE_KEYS, SECTION_KEYS } from '../domain/types'
import { formatCurrency } from './currency'

const HEADER_ART_DATA_URI =
  'data:image/gif;base64,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'

interface ProposalHtmlOptions {
  meta?: Partial<ProposalMeta>
  generatedAt?: number | Date
}

interface FeatureItem {
  title: string
  description: string
  icon:
  | 'calendar'
  | 'user'
  | 'document'
  | 'monitor'
  | 'sparkles'
  | 'bell'
  | 'chart'
  | 'building'
  | 'users'
  | 'target'
  | 'news'
  | 'camera'
  | 'api'
  | 'mail'
  | 'team'
  | 'file'
  | 'cloud'
  | 'shield'
  | 'globe'
  | 'specialists'
  | 'lock'
  | 'email'
  | 'phone'
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.max(0, Math.round(value)))
}

function formatLongDate(value: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value)
}

function buildKeywordsFallback(input: CalculationInput): string {
  for (const key of SECTION_KEYS) {
    const first = input.sections[key].keywords[0]?.trim()
    if (first) return first
  }
  return 'Cliente'
}

function resolveClientName(
  input: CalculationInput,
  options?: ProposalHtmlOptions,
): string {
  return options?.meta?.clientName?.trim() || buildKeywordsFallback(input)
}

function collectSectionServices(
  section: CalculationInput['sections'][SectionKey],
): string[] {
  return MONITORING_SERVICE_KEYS.filter((key) => section.services[key]).map(
    (key) => MONITORING_LABELS[key],
  )
}

function resolveScopeFocus(input: CalculationInput): string {
  const activeLabels = SECTION_KEYS.filter(
    (key) => input.sections[key].keywords.length > 0,
  ).map((key) => SECTION_LABELS[key].toLowerCase())

  if (!activeLabels.length) return 'marcas, concorrentes e setor'
  if (activeLabels.length === 1) return activeLabels[0]
  if (activeLabels.length === 2) return `${activeLabels[0]} e ${activeLabels[1]}`

  return `${activeLabels.slice(0, -1).join(', ')} e ${activeLabels.at(-1)}`
}

function renderIcon(kind: FeatureItem['icon']): string {
  switch (kind) {
    case 'calendar':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"></rect><path d="M7 3.5v3M17 3.5v3M3.5 9.5h17"></path></svg>'
    case 'user':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z"></path><path d="M5 20a7 7 0 0 1 14 0"></path></svg>'
    case 'document':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5a1.5 1.5 0 0 1 1-1.4Z"></path><path d="M14 3.5V8h4M9 12h6M9 15h6"></path></svg>'
    case 'monitor':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="11.5" rx="2.2"></rect><path d="M8 20h8M12 16v4"></path></svg>'
    case 'sparkles':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Zm7 10l.9 2.1L22 16l-2.1.9L19 19l-.9-2.1L16 16l2.1-.9L19 13ZM5 14l1 2.4L8.5 17 6 18l-1 2.5L4 18l-2.5-1L4 16.4 5 14Z"></path></svg>'
    case 'bell':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5a4 4 0 0 0-4 4v2.1c0 .8-.2 1.5-.7 2.2L5.8 15h12.4l-1.5-2.2a4 4 0 0 1-.7-2.2V8.5a4 4 0 0 0-4-4Z"></path><path d="M10 18a2 2 0 0 0 4 0"></path></svg>'
    case 'chart':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5h16"></path><path d="M7 16V9"></path><path d="M12 16V6"></path><path d="M17 16v-4"></path></svg>'
    case 'building':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V20"></path><path d="M9 8.5h1M14 8.5h1M9 12h1M14 12h1M11.5 20v-3.5h1V20"></path></svg>'
    case 'users':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7ZM17 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Z"></path><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 19a4 4 0 0 1 6.5-3.1"></path></svg>'
    case 'target':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5"></circle><circle cx="12" cy="12" r="3.5"></circle><path d="M12 2.5v3M21.5 12h-3M12 21.5v-3M2.5 12h3"></path></svg>'
    case 'news':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.2"></rect><path d="M8 9h8M8 12h8M8 15h5"></path></svg>'
    case 'camera':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7.5h2.2l1.2-1.8h3.2l1.2 1.8H17A2.5 2.5 0 0 1 19.5 10v6A2.5 2.5 0 0 1 17 18.5H7A2.5 2.5 0 0 1 4.5 16v-6A2.5 2.5 0 0 1 7 7.5Z"></path><circle cx="12" cy="13" r="3"></circle></svg>'
    case 'api':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6 4.5 12 8 18M16 6l3.5 6-3.5 6M13.5 4 10.5 20"></path></svg>'
    case 'mail':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2.2"></rect><path d="m4.5 8.5 7.5 5 7.5-5"></path></svg>'
    case 'team':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5ZM16.5 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Z"></path><path d="M3.5 18a4 4 0 0 1 8 0M12.5 18a4 4 0 0 1 8 0"></path></svg>'
    case 'file':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7 3.5Z"></path><path d="M14 3.5V8h4M9 12h6M9 15h4"></path></svg>'
    case 'cloud':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 18.5h8a4 4 0 0 0 .3-8a5.5 5.5 0 0 0-10.6 1.7A3.3 3.3 0 0 0 8.5 18.5Z"></path></svg>'
    case 'shield':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 18.5 6v5c0 4.1-2.3 7.8-6.5 9.5C7.8 18.8 5.5 15.1 5.5 11V6L12 3.5Z"></path><path d="m9.5 12 1.8 1.8 3.4-3.8"></path></svg>'
    case 'globe':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M3.8 12h16.4M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17"></path></svg>'
    case 'specialists':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7Z"></path><path d="M5 20a7 7 0 0 1 14 0"></path><path d="m18.5 7.5 1 2 2 .9-2 .9-1 2-.9-2-2-.9 2-.9.9-2Z"></path></svg>'
    case 'lock':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10" width="13" height="10" rx="2.2"></rect><path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2"></path></svg>'
    case 'email':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z"></path><path d="m4.5 8 7.5 5 7.5-5"></path></svg>'
    case 'phone':
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 4.5h2.7l1.1 4-2 1.2a14 14 0 0 0 5 5l1.2-2 4 1.1v2.7A1.8 1.8 0 0 1 17.7 20C10.6 20 4 13.4 4 6.3A1.8 1.8 0 0 1 5.8 4.5Z"></path></svg>'
  }
}

function renderFeatureCard(item: FeatureItem, tone: 'default' | 'soft' = 'default'): string {
  return `
    <article class="feature-card feature-card--${tone}">
      <span class="feature-card__icon" aria-hidden="true">
        ${renderIcon(item.icon)}
      </span>
      <div>
        <strong class="feature-card__title">${escapeHtml(item.title)}</strong>
        <p class="feature-card__text">${escapeHtml(item.description)}</p>
      </div>
    </article>
  `
}

function buildScopeCard(
  key: SectionKey,
  input: CalculationInput,
  accent: 'brand' | 'magenta' | 'cyan',
): string {
  const section = input.sections[key]
  const services = collectSectionServices(section)
  const keywords = section.keywords.length
    ? section.keywords
      .map(
        (keyword) =>
          `<p class="scope-card__keyword">${escapeHtml(keyword)}</p>`,
      )
      .join('')
    : '<p class="scope-card__keyword scope-card__keyword--muted">Não informado</p>'

  return `
    <article class="scope-card">
      <div class="scope-card__head">
        <span class="scope-card__badge scope-card__badge--${accent}" aria-hidden="true">
          ${renderIcon(
    key === 'marcas' ? 'building' : key === 'concorrentes' ? 'users' : 'target',
  )}
        </span>
        <div>
          <h3 class="scope-card__title">${escapeHtml(SECTION_LABELS[key].toUpperCase())}</h3>
          <div class="scope-card__summary-label">Palavras-chave</div>
          <div class="scope-card__keywords">${keywords}</div>
        </div>
      </div>
      <div class="scope-card__stat-label">Volume estimado</div>
      <div class="scope-card__stat-value">${escapeHtml(formatInteger(section.volume))}</div>
      <div class="scope-card__stat-sub">notícias / mês</div>
      <div class="scope-card__divider"></div>
      <div class="scope-card__services-title">Serviços aplicados</div>
      <div class="tag-list">
        ${services.length
      ? services
        .map((service) => `<span class="tag">${escapeHtml(service)}</span>`)
        .join('')
      : '<span class="tag tag--muted">A definir</span>'
    }
      </div>
    </article>
  `
}

function buildExecutiveSummary(clientName: string, input: CalculationInput): string {
  const focus = resolveScopeFocus(input)
  return `
    <p>Esta proposta contempla o monitoramento estratégico da marca ${escapeHtml(clientName)}, com foco em ${escapeHtml(focus)}, com coleta, análise e entrega de informações relevantes em tempo real.</p>
    <p>Nosso objetivo é transformar dados de mídia em inteligência para apoiar decisões e fortalecer sua presença no mercado.</p>
  `
}

function buildServiceHighlights(
  input: CalculationInput,
  calc: CalculationResult,
): FeatureItem[] {
  const selected = new Set(calc.selectedMonitoringLabels)
  const items: FeatureItem[] = []

  if (calc.totalKeywords > 0 || calc.totalVolume > 0) {
    items.push({
      title: 'Coleta de notícias',
      description: 'Fontes online, portais, blogs e veículos.',
      icon: 'news',
    })
  }

  if (
    selected.has('IA') ||
    selected.has('Score') ||
    selected.has('Avaliação') ||
    selected.has('Grifo') ||
    selected.has('Centimetragem')
  ) {
    items.push({
      title: 'Análise e classificação',
      description: 'IA para relevância, sentimento e contexto.',
      icon: 'sparkles',
    })
  }

  if (input.additionals.alertasWeb || input.operational.enviosDiarios > 0) {
    items.push({
      title: 'Alertas inteligentes',
      description: 'Notificações em tempo real por e-mail.',
      icon: 'bell',
    })
  }

  if (selected.has('Screenshot')) {
    items.push({
      title: 'Screenshot',
      description: 'Captura de imagens das notícias.',
      icon: 'camera',
    })
  }

  if (input.broadcast.relatorioEnabled || input.operational.enviosDiarios > 0) {
    items.push({
      title: 'Relatórios',
      description: 'Relatórios diários, semanais e mensais.',
      icon: 'chart',
    })
  }

  if (input.additionals.api) {
    items.push({
      title: 'API de dados',
      description: 'Integração para sistemas internos.',
      icon: 'api',
    })
  }

  if (input.additionals.midiasSociais) {
    items.push({
      title: 'Mídias sociais',
      description: 'Cobertura complementar de perfis e canais.',
      icon: 'monitor',
    })
  }

  if (input.broadcast.tvEnabled || input.broadcast.radioEnabled) {
    items.push({
      title: 'Broadcast',
      description: 'Cobertura complementar para TV e rádio.',
      icon: 'document',
    })
  }

  return items.slice(0, 6)
}

function buildDeliveryItems(input: CalculationInput): FeatureItem[] {
  const reportLabel = input.broadcast.relatorioEnabled
    ? input.broadcast.relatorioFreq === 'semanal'
      ? 'relatório semanal'
      : 'relatório mensal'
    : null

  const accessLabel = input.additionals.api
    ? 'Plataforma online e integração via API.'
    : 'Plataforma online com histórico e busca inteligente.'

  return [
    {
      title: 'Frequência de envio',
      description: `${formatInteger(input.operational.enviosDiarios)} ${input.operational.enviosDiarios === 1 ? 'envio por dia' : 'envios por dia'}`,
      icon: 'mail',
    },
    {
      title: 'Destinatários',
      description: `${formatInteger(input.operational.numDestinatarios)} ${input.operational.numDestinatarios === 1 ? 'destinatário' : 'destinatários'}`,
      icon: 'team',
    },
    {
      title: 'Formatos de entrega',
      description: reportLabel
        ? `Newsletter diária e ${reportLabel}.`
        : 'Newsletter diária e acompanhamento contínuo.',
      icon: 'file',
    },
    {
      title: 'Acesso',
      description: accessLabel,
      icon: 'cloud',
    },
  ]
}

function buildInstitutionalItems(): FeatureItem[] {
  return [
    {
      title: 'Monitoramento 24/7',
      description: 'Cobertura contínua de milhares de fontes online.',
      icon: 'monitor',
    },
    {
      title: 'Inteligência artificial',
      description: 'Classificação automática e análise de sentimento.',
      icon: 'sparkles',
    },
    {
      title: 'Alertas em tempo real',
      description: 'Notificações instantâneas sobre assuntos relevantes.',
      icon: 'bell',
    },
    {
      title: 'Relatórios inteligentes',
      description: 'Dashboards e relatórios claros para tomada de decisão.',
      icon: 'chart',
    },
  ]
}

function buildWhyChooseItems(): FeatureItem[] {
  return [
    {
      title: 'Tecnologia avançada',
      description: 'IA e automação para entregar informações com precisão e agilidade.',
      icon: 'shield',
    },
    {
      title: 'Cobertura ampla',
      description: 'Monitoramos milhares de fontes relevantes em todo o país e no mundo.',
      icon: 'globe',
    },
    {
      title: 'Especialistas de verdade',
      description: 'Equipe experiente que transforma dados em insights acionáveis para o seu negócio.',
      icon: 'specialists',
    },
    {
      title: 'Segurança e confidencialidade',
      description: 'Seus dados protegidos com os mais altos padrões de segurança da informação.',
      icon: 'lock',
    },
  ]
}

export function buildProposalHtml(
  input: CalculationInput,
  calc: CalculationResult,
  options?: ProposalHtmlOptions,
): string {
  const clientName = resolveClientName(input, options)
  const generatedAt = options?.generatedAt
    ? new Date(options.generatedAt)
    : new Date()

  const investmentRows = [
    {
      label: 'Preço base mensal',
      value: formatCurrency(calc.breakdownGroups.precoBaseMensal),
      rowClass: '',
    },
    {
      label: 'Serviços de monitoramento',
      value: formatCurrency(calc.breakdownGroups.servicosMonitoramento),
      rowClass: '',
    },
    {
      label: 'Serviços adicionais',
      value: formatCurrency(calc.breakdownGroups.servicosAdicionais),
      rowClass: '',
    },
    {
      label: 'Relatório analítico',
      value: formatCurrency(calc.breakdownGroups.relatorioAnalitico),
      rowClass: '',
    },
  ]

  if (calc.valorAcrescimoFimDeSemana > 0) {
    investmentRows.push({
      label: 'Acréscimos',
      value: `+ ${formatCurrency(calc.valorAcrescimoFimDeSemana)}`,
      rowClass: ' investment-row--increase',
    })
  }

  if (calc.valorImpactoAprovacaoAutomatica < 0) {
    investmentRows.push({
      label: 'Descontos',
      value: `− ${formatCurrency(Math.abs(calc.valorImpactoAprovacaoAutomatica))}`,
      rowClass: ' investment-row--discount',
    })
  }

  const institutionalItems = buildInstitutionalItems()
  const serviceHighlights = buildServiceHighlights(input, calc)
  const serviceHighlightsColumns = Math.max(serviceHighlights.length, 1)
  const deliveryItems = buildDeliveryItems(input)
  const whyChooseItems = buildWhyChooseItems()

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposta comercial · CService</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

    :root {
      color-scheme: light;
      --ink: #17223f;
      --ink-soft: #5f6b86;
      --line: #e5e8f0;
      --surface: #ffffff;
      --surface-soft: #f7f8fc;
      --brand: #0d66ff;
      --brand-strong: #041a78;
      --cyan: #21d3f6;
      --magenta: #ff0b8a;
      --shadow: 0 18px 40px rgba(4, 26, 120, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #eef2f8;
      color: var(--ink);
      font-family: "Montserrat", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    body {
      padding: 24px;
    }

    .proposal-shell {
      max-width: 980px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid #dbe3f0;
      border-radius: 0;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .proposal-topbar {
      height: 100px;
      background: #041a78 url("${HEADER_ART_DATA_URI}") center / cover no-repeat;
    }

    .proposal-body {
      background: #fbfcff;
    }

    .intro {
      display: grid;
      grid-template-columns: minmax(0, 1.22fr) minmax(320px, 0.9fr);
      gap: 22px;
      padding: 18px 30px 12px;
      background: #fbfcff;
      border-bottom: 1px solid #e9edf4;
    }

    .intro__eyebrow {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.01em;
      color: #1fd0f3;
    }

    .intro__title {
      margin: 0 0 4px;
      font-size: 30px;
      font-weight: 500;
      letter-spacing: -0.035em;
      line-height: 1.02;
      color: #11245a;
    }

    .intro__lead {
      margin: 0;
      max-width: 36ch;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.65;
      color: #5d6781;
    }

    .intro__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 34px;
      margin-top: 26px;
    }

    .meta-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      min-width: 0;
    }

    .meta-item__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
      flex-shrink: 0;
      margin-top: 3px;
    }

    .meta-item__icon svg,
    .feature-card__icon svg,
    .scope-card__badge svg,
    .contact-line__icon svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.85;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .meta-item__label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
      color: #6c7893;
    }

    .meta-item__value {
      display: block;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: #1b2a54;
    }

    .price-card {
      position: relative;
      align-self: start;
      margin-top: 4px;
      padding: 20px 24px 18px;
      border: 1px solid #e6ebf3;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 10px 24px rgba(10, 43, 140, 0.06);
      text-align: center;
      overflow: hidden;
    }

    .price-card::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 4px;
      background: linear-gradient(90deg, var(--cyan) 0%, var(--brand) 54%, var(--magenta) 100%);
    }

    .price-card__label {
      margin: 0;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #27314d;
    }

    .price-card__value {
      margin: 14px 0 8px;
      font-size: 41px;
      font-weight: 500;
      line-height: 1;
      letter-spacing: -0.05em;
      color: var(--brand);
    }

    .price-card__hint {
      margin: 0;
      font-size: 13px;
      color: #5e6984;
    }

    .content-section {
      padding: 16px 30px;
      border-top: 1px solid var(--line);
      background: #fff;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(290px, 0.92fr);
      gap: 22px;
      align-items: start;
    }

    .section-heading {
      margin: 0 0 12px;
      font-size: 17px;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: #11245a;
      text-transform: uppercase;
    }

    .section-heading--inline {
      margin-bottom: 14px;
    }

    .executive-card {
      display: flex;
      gap: 14px;
      min-width: 0;
    }

    .executive-card__icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
    }

    .executive-card__icon svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .executive-card__title {
      margin: 2px 0 8px;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: #16285c;
      text-transform: uppercase;
    }

    .executive-card p {
      margin: 0 0 8px;
      color: #5d6780;
      font-size: 12px;
      line-height: 1.55;
    }

    .feature-column {
      display: grid;
      gap: 10px;
      align-content: start;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(var(--feature-grid-columns, 5), minmax(0, 1fr));
      gap: 14px;
    }

    .feature-grid--services {
      gap: 0;
    }

    .feature-grid--four {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .feature-grid--two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px 18px;
    }

    .feature-card {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      min-width: 0;
    }

    .feature-grid--services .feature-card {
      min-height: 82px;
      padding: 12px 12px 10px;
      border-right: 1px solid #eef2f7;
    }

    .feature-grid--services .feature-card:last-child {
      border-right: none;
    }

    .feature-card__icon {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
    }

    .feature-card--soft .feature-card__icon {
      color: var(--brand);
    }

    .feature-card__icon svg {
      width: 20px;
      height: 20px;
    }

    .feature-card__title {
      display: block;
      font-size: 11.5px;
      font-weight: 500;
      line-height: 1.35;
      color: #1b2c5a;
    }

    .feature-card__text {
      margin: 2px 0 0;
      font-size: 10.5px;
      line-height: 1.45;
      color: #66718c;
    }

    .scope-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .scope-card {
      padding: 12px 12px 10px;
      border: 1px solid #e3e8f1;
      border-radius: 2px;
      background: #fff;
      min-height: 100%;
    }

    .scope-card__head {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .scope-card__badge {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      color: #fff;
    }

    .scope-card__badge--brand {
      background: var(--brand);
    }

    .scope-card__badge--magenta {
      background: var(--magenta);
    }

    .scope-card__badge--cyan {
      background: var(--cyan);
    }

    .scope-card__title {
      margin: 2px 0 4px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: #16285c;
    }

    .scope-card__summary-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #7d89a1;
    }

    .scope-card__keywords {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    .scope-card__keyword {
      margin: 0;
      width: max-content;
      padding: 2px 6px;
      border-radius: 2px;
      background-color: #eef2f8;
      font-size: 9.5px;
      font-weight: 500;
      line-height: 1.35;
      color: #59637e;
    }

    .scope-card__keyword--muted {
      background-color: #f4f6fa;
      color: #76829d;
    }

    .scope-card__stat-label,
    .scope-card__services-title {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #7d89a1;
    }

    .scope-card__stat-value {
      margin-top: 6px;
      font-size: 26px;
      font-weight: 500;
      line-height: 1;
      letter-spacing: -0.05em;
      color: var(--brand);
    }

    .scope-card__stat-sub {
      margin-top: 2px;
      font-size: 10.5px;
      color: #68748f;
    }

    .scope-card__divider {
      height: 1px;
      margin: 12px 0 10px;
      background: var(--line);
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      padding: 3px 7px;
      border-radius: 4px;
      background: #eef2f8;
      font-size: 9.5px;
      font-weight: 500;
      color: #40506d;
    }

    .tag--muted {
      background: #f4f6fa;
      color: #76829d;
    }

    .investment-layout {
      display: grid;
      grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
      gap: 18px;
      align-items: start;
    }

    .investment-layout__column {
      min-width: 0;
    }

    .investment-layout__column--right {
      padding-left: 18px;
      border-left: 1px solid #eceff5;
    }

    .delivery-list {
      display: grid;
      gap: 14px;
    }

    .delivery-list .feature-card {
      padding-right: 10px;
    }

    .investment-card {
      background: #fff;
    }

    .investment-card__body {
      padding: 0;
    }

    .investment-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 16px;
      align-items: center;
      padding: 11px 0;
      border-bottom: 1px solid #edf1f7;
      font-size: 12px;
      color: #59657f;
    }

    .investment-row strong {
      color: #1d2d58;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .investment-row--increase span,
    .investment-row--increase strong {
      color: #1d7d46;
    }

    .investment-row--discount span,
    .investment-row--discount strong {
      color: #cf3e3e;
    }

    .investment-total {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 16px;
      align-items: center;
      margin-top: 12px;
      padding: 12px 16px;
      background: #f3f7ff;
      color: var(--brand);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      border-radius: 6px;
    }

    .investment-total strong {
      font-size: 16px;
      letter-spacing: -0.04em;
      font-variant-numeric: tabular-nums;
    }

    .why-choose {
      background: #fbfcff;
    }

    .why-choose__title {
      margin: 0 0 12px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: #16285c;
      text-transform: uppercase;
    }

    .why-choose__title span {
      color: #1dcff3;
    }

    .footer-band {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 22px;
      padding: 18px 30px 20px;
      background: var(--brand-strong);
      color: #fff;
      overflow: hidden;
    }

    .footer-band::before,
    .footer-band::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      pointer-events: none;
      opacity: 0.96;
    }

    .footer-band::before {
      width: 190px;
      height: 190px;
      left: -86px;
      bottom: -106px;
      background:
        radial-gradient(circle at 44% 46%, transparent 0 39%, var(--brand-strong) 39.5% 100%),
        linear-gradient(145deg, var(--cyan) 0%, var(--cyan) 64%, transparent 64% 100%);
    }

    .footer-band::after {
      width: 230px;
      height: 180px;
      right: -92px;
      bottom: -104px;
      background:
        radial-gradient(circle at 68% 34%, rgba(33, 211, 246, 0.95) 0 34%, transparent 35% 100%),
        radial-gradient(circle at 28% 68%, rgba(255, 11, 138, 0.95) 0 33%, transparent 34% 100%);
    }

    .footer-panel {
      position: relative;
      z-index: 1;
    }

    .footer-panel__title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      color: #21d3f6;
    }

    .footer-panel__text {
      margin: 0;
      font-size: 11px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.92);
      max-width: 38ch;
    }

    .contact-list {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }

    .contact-line {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.92);
    }

    .contact-line__icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ff4eaa;
    }

    @media (max-width: 920px) {
      body {
        padding: 0;
      }

      .proposal-shell {
        border: none;
        box-shadow: none;
      }

      .intro,
      .summary-grid,
      .investment-layout,
      .footer-band {
        grid-template-columns: 1fr;
      }

      .scope-grid,
      .feature-grid,
      .feature-grid--four,
      .feature-grid--two {
        grid-template-columns: 1fr 1fr;
      }

      .feature-grid--services {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .investment-layout__column--right {
        padding-left: 0;
        border-left: none;
      }

      .price-card__value {
        font-size: 48px;
      }
    }

    @media (max-width: 640px) {
      .proposal-topbar,
      .intro,
      .content-section,
      .footer-band {
        padding-left: 20px;
        padding-right: 20px;
      }

      .intro__title {
        font-size: 34px;
      }

      .scope-grid,
      .feature-grid,
      .feature-grid--four,
      .feature-grid--two {
        grid-template-columns: 1fr;
      }

      .feature-grid--services .feature-card {
        border-right: none;
        border-bottom: 1px solid #eef2f7;
      }

      .feature-grid--services .feature-card:last-child {
        border-bottom: none;
      }

      .price-card__value {
        font-size: 42px;
      }
    }

    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      body {
        padding: 0;
        background: #fff;
      }

      .proposal-shell {
        box-shadow: none;
        border: none;
      }
    }
  </style>
</head>
<body>
  <main class="proposal-shell">
    <header class="proposal-topbar" aria-label="CService"></header>

    <div class="proposal-body">
      <section class="intro">
        <div>
          <h1 class="intro__title">PROPOSTA COMERCIAL</h1>
          <p class="intro__eyebrow">MONITORAMENTO DE MÍDIA</p>
          <p class="intro__lead">Solução completa para monitoramento, análise e entrega de informações estratégicas em tempo real.</p>

          <div class="intro__meta">
            <div class="meta-item">
              <span class="meta-item__icon" aria-hidden="true">${renderIcon('calendar')}</span>
              <div>
                <span class="meta-item__label">Data da proposta</span>
                <span class="meta-item__value">${escapeHtml(formatLongDate(generatedAt))}</span>
              </div>
            </div>
            <div class="meta-item">
              <span class="meta-item__icon" aria-hidden="true">${renderIcon('user')}</span>
              <div>
                <span class="meta-item__label">Proposta para</span>
                <span class="meta-item__value">${escapeHtml(clientName)}</span>
              </div>
            </div>
          </div>
        </div>

        <aside class="price-card" aria-label="Investimento mensal">
          <p class="price-card__label">Investimento mensal</p>
          <p class="price-card__value">${escapeHtml(formatCurrency(calc.finalPrice))}</p>
          <p class="price-card__hint">por mês</p>
        </aside>
      </section>

      <section class="content-section">
        <div class="summary-grid">
          <div class="executive-card">
            <span class="executive-card__icon" aria-hidden="true">${renderIcon('document')}</span>
            <div>
              <h2 class="executive-card__title">Resumo Executivo</h2>
              ${buildExecutiveSummary(clientName, input)}
            </div>
          </div>

          <div class="feature-column">
            ${institutionalItems.map((item) => renderFeatureCard(item)).join('')}
          </div>
        </div>
      </section>

      <section class="content-section">
        <h2 class="section-heading section-heading--inline">Escopo do monitoramento</h2>
        <div class="scope-grid">
          ${buildScopeCard('marcas', input, 'brand')}
          ${buildScopeCard('concorrentes', input, 'magenta')}
          ${buildScopeCard('setor', input, 'cyan')}
        </div>
      </section>

      <section class="content-section">
        <h2 class="section-heading section-heading--inline">Serviços incluídos</h2>
        <div class="feature-grid feature-grid--services" style="--feature-grid-columns: ${serviceHighlightsColumns};">
          ${serviceHighlights.map((item) => renderFeatureCard(item, 'soft')).join('')}
        </div>
      </section>

      <section class="content-section">
        <div class="investment-layout">
          <div class="investment-layout__column">
            <h2 class="section-heading section-heading--inline">Distribuição e entrega</h2>
            <div class="delivery-list">
              ${deliveryItems.map((item) => renderFeatureCard(item)).join('')}
            </div>
          </div>

          <div class="investment-layout__column investment-layout__column--right">
            <h2 class="section-heading section-heading--inline">Composição do investimento</h2>
            <div class="investment-card">
              <div class="investment-card__body">
                ${investmentRows
      .map(
        (row) => `
                      <div class="investment-row${row.rowClass}">
                        <span>${escapeHtml(row.label)}</span>
                        <strong>${escapeHtml(row.value)}</strong>
                      </div>
                    `,
      )
      .join('')}
              </div>
              <div class="investment-total">
                <span>Investimento mensal total</span>
                <strong>${escapeHtml(formatCurrency(calc.finalPrice))}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section why-choose">
        <h2 class="why-choose__title">Por que escolher a <span>CService</span>?</h2>
        <div class="feature-grid feature-grid--four">
          ${whyChooseItems.map((item) => renderFeatureCard(item)).join('')}
        </div>
      </section>

      <footer class="footer-band">
        <section class="footer-panel">
          <h2 class="footer-panel__title">
            <span class="contact-line__icon" aria-hidden="true">${renderIcon('monitor')}</span>
            Próximos passos
          </h2>
          <p class="footer-panel__text">
            Para continuidade, basta confirmar a aprovação desta proposta.
            Após a confirmação, iniciamos o processo de implementação em até 2 dias úteis.
          </p>
        </section>

        <section class="footer-panel">
          <h2 class="footer-panel__title">Dúvidas?</h2>
          <p class="footer-panel__text">Estou à disposição para qualquer esclarecimento.</p>
          <div class="contact-list">
            <div class="contact-line">
              <span class="contact-line__icon" aria-hidden="true">${renderIcon('email')}</span>
              <span>comercial@cservice.com.br</span>
            </div>
            <div class="contact-line">
              <span class="contact-line__icon" aria-hidden="true">${renderIcon('phone')}</span>
              <span>(11) 98765-4312</span>
            </div>
          </div>
        </section>
      </footer>
    </div>
  </main>
</body>
</html>`
}
