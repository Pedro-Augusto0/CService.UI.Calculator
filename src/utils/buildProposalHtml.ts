import type {
  AdditionalsState,
  CalculationInput,
  CalculationResult,
  ProposalMeta,
  ReportsState,
  SectionKey,
} from '@/domain/types'
import {
  MATTER_SERVICE_LABELS,
  REGION_LABELS,
  REPORT_FREQUENCY_LABELS,
  SECTION_LABELS,
} from '@/domain/prices'
import { MATTER_SERVICE_KEYS, SECTION_KEYS } from '@/domain/types'
/** URL do asset pelo Vite (`/assets/...png`) — dentro de iframe `srcDoc` ou não. */
import proposalHeaderBannerUrl from '@/assets/result_logo_cabecalho_padrao.png'
import { formatCurrency } from '@/utils/currency'

interface ProposalHtmlOptions {
  meta?: Partial<ProposalMeta>
  generatedAt?: number | Date
  /** Rodapé — opcional para espelhar materiais oficiais */
  contactEmail?: string
  contactPhone?: string
}

interface InvestmentDetailItem {
  label: string
  value: string
}

/** Blocos da composição do investimento (painel direito) */
interface CompositionLine {
  label: string
  value: string
  rowClass?: string
}

interface CompositionBlock {
  /** Se null, linhas em formato “raiz” (ex.: preço base, acréscimos) */
  sectionTitle: string | null
  lines: CompositionLine[]
}

interface DistributionRow {
  title: string
  body: string
  icon: 'calendar' | 'users' | 'layers' | 'globe'
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/** Para usar caminho de asset dentro de `url('…')` em CSS */
function escapeCssSingleQuotedString(s: string): string {
  return s.replace(/\\/g, '/').replace(/'/g, "\\'")
}

/** Em documentos gerados (`iframe` + `srcDoc`), `url(/assets/…)` pode não resolver para o servidor da app; usar URL absoluta. */
function resolveEmbeddedAssetCssUrl(bundleUrlFromVite: string): string {
  const cleaned = bundleUrlFromVite.replace(/[?#].*$/, '')
  if (
    typeof window === 'undefined' ||
    cleaned.startsWith('data:')
  ) {
    return cleaned
  }
  try {
    const base =
      cleaned.startsWith('/') || /^https?:\/\//i.test(cleaned)
        ? `${window.location.origin}/`
        : window.location.href
    return new URL(cleaned, base).href
  } catch {
    return cleaned
  }
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.max(0, Math.round(value)))
}

function formatLongDateUppercase(value: Date): string {
  const s = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value)
  return s.toLocaleUpperCase('pt-BR')
}

function resolveClientName(
  input: CalculationInput,
  options?: ProposalHtmlOptions,
): string {
  if (options?.meta?.clientName?.trim()) return options.meta.clientName.trim()
  for (const key of SECTION_KEYS) {
    const first = input.sections[key].keywords[0]?.trim()
    if (first) return first
  }
  return 'Cliente'
}

function collectSectionServices(
  section: CalculationInput['sections'][SectionKey],
): string[] {
  return MATTER_SERVICE_KEYS.filter((key) => section.services[key]).map(
    (key) => MATTER_SERVICE_LABELS[key],
  )
}

function buildMatterDetails(calc: CalculationResult): InvestmentDetailItem[] {
  return MATTER_SERVICE_KEYS.filter((k) => calc.matterServiceValues[k] > 0).map(
    (k) => ({
      label: MATTER_SERVICE_LABELS[k],
      value: formatCurrency(calc.matterServiceValues[k]),
    }),
  )
}

function buildReportsLabels(reports: ReportsState): InvestmentDetailItem[] {
  const items: InvestmentDetailItem[] = []
  if (reports.executiveEnabled && reports.executiveFrequency) {
    items.push({
      label: `Relatório Executivo (${REPORT_FREQUENCY_LABELS[reports.executiveFrequency]})`,
      value: '',
    })
  }
  if (reports.strategicEnabled && reports.strategicFrequency) {
    items.push({
      label: `Relatório Estratégico (${REPORT_FREQUENCY_LABELS[reports.strategicFrequency]})`,
      value: '',
    })
  }
  if (reports.biEnabled) {
    items.push({ label: 'CService BI (setup + manutenção mensal)', value: '' })
  }
  return items
}

function buildAdditionalsLabels(additionals: AdditionalsState): InvestmentDetailItem[] {
  const a = additionals
  const items: InvestmentDetailItem[] = []
  if (a.printEnabled) {
    items.push({ label: 'Impresso', value: '' })
  }
  if (a.webNationalEnabled) {
    items.push({ label: 'Web (Nacional)', value: '' })
  }
  if (a.webInternationalEnabled) {
    items.push({ label: 'Web (Internacional)', value: '' })
  }
  if (a.radioEnabled && a.radioRegion) {
    items.push({ label: `Rádio ${REGION_LABELS[a.radioRegion]}`, value: '' })
  }
  if (a.tvEnabled && a.tvRegion) {
    items.push({ label: `TV ${REGION_LABELS[a.tvRegion]}`, value: '' })
  }
  if (a.socialMediaEnabled) items.push({ label: 'Mídias Sociais', value: '' })
  if (a.storiesInstagramEnabled) items.push({ label: 'Stories Instagram', value: '' })
  if (a.webRealtimeAlerts) items.push({ label: 'Alertas Web em Tempo Real', value: '' })
  if (a.apiCService) items.push({ label: 'Integração via API CService', value: '' })
  if (a.newsletterWhatsApp) items.push({ label: 'Newsletter via WhatsApp', value: '' })
  if (a.newsletterExtraSends > 0) {
    items.push({
      label: `Newsletter Adicional (${a.newsletterExtraSends}x)`,
      value: '',
    })
  }
  if (a.extraRecipientsEnabled) items.push({ label: 'Destinatários Adicionais', value: '' })
  if (a.manualCuration) items.push({ label: 'Curadoria e Aprovação Manual', value: '' })
  return items
}

function iconSvg(kind: DistributionRow['icon']): string {
  const stroke = 'stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"'
  switch (kind) {
    case 'calendar':
      return `<svg class="dist-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" ${stroke}/><path d="M3 10h18M8 3v4M16 3v4" ${stroke}/></svg>`
    case 'users':
      return `<svg class="dist-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" ${stroke}/><path d="M4 20v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" ${stroke}/><circle cx="17" cy="9" r="2.5" ${stroke}/><path d="M21 20v-1a3 3 0 0 0-2.2-2.9" ${stroke}/></svg>`
    case 'layers':
      return `<svg class="dist-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5Z" ${stroke}/><path d="m3 12 9 5 9-5M3 16l9 5 9-5" ${stroke}/></svg>`
    case 'globe':
      return `<svg class="dist-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" ${stroke}/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" ${stroke}/></svg>`
    default:
      return ''
  }
}

function buildDistributionRows(input: CalculationInput): DistributionRow[] {
  const r = input.reports
  const a = input.additionals
  const freqParts: string[] = []
  if (r.executiveEnabled && r.executiveFrequency) {
    freqParts.push(`Relatório Executivo (${REPORT_FREQUENCY_LABELS[r.executiveFrequency]})`)
  }
  if (r.strategicEnabled && r.strategicFrequency) {
    freqParts.push(`Relatório Estratégico (${REPORT_FREQUENCY_LABELS[r.strategicFrequency]})`)
  }
  if (a.newsletterWhatsApp) freqParts.push('Newsletter por WhatsApp conforme configuração')
  if (a.webRealtimeAlerts) freqParts.push('Alertas web em tempo real')
  const freq =
    freqParts.length > 0
      ? freqParts.join(' · ')
      : 'Definido conforme escopo contratado e rotinas da plataforma'

  let dest = 'Quadro padrão de destinatários do pacote.'
  if (a.extraRecipientsEnabled) dest += ' Inclusão de destinatários adicionais contratada.'

  const formats: string[] = ['Relatórios e alertas em PDF e HTML']
  if (a.newsletterWhatsApp) formats.push('envios por WhatsApp')
  if (a.apiCService) formats.push('Integração programática via API')
  const formatsStr = formats.join('; ') + '.'

  let access = 'Portal web CService com histórico, buscas e painéis.'
  if (a.apiCService) access += ' Acesso complementar por API para ingestão de dados.'

  return [
    { title: 'Frequência de envio', body: freq, icon: 'calendar' },
    { title: 'Destinatários', body: dest, icon: 'users' },
    { title: 'Formatos de entrega', body: formatsStr, icon: 'layers' },
    { title: 'Acesso', body: access, icon: 'globe' },
  ]
}

function metaIcon(kind: 'calendar' | 'user'): string {
  const stroke = 'stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round"'
  if (kind === 'calendar') {
    return `<svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" ${stroke}/><path d="M3 10h18M8 3v4M16 3v4" ${stroke}/></svg>`
  }
  return `<svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" ${stroke}/><path d="M6 20v-1a6 6 0 0 1 12 0v1" ${stroke}/></svg>`
}

function featureIcon(kind: 'monitor' | 'brain' | 'bell' | 'chart'): string {
  const s = 'stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"'
  switch (kind) {
    case 'monitor':
      return `<svg class="feature-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2" ${s}/><path d="M8 20h8M12 16v4" ${s}/></svg>`
    case 'brain':
      return `<svg class="feature-icon" viewBox="0 0 24 24"><path d="M12 5a3 3 0 0 0-3 3v1a3 3 0 1 0 3 10 3 3 0 1 0 3-10V8a3 3 0 0 0-3-3Z" ${s}/><path d="M9 9v6M15 9v6" ${s}/></svg>`
    case 'bell':
      return `<svg class="feature-icon" viewBox="0 0 24 24"><path d="M14 18a2 2 0 1 1-4 0M7 9a5 5 0 0 1 10 0c0 5 2 5 2 7H5c0-2 2-2 2-7" ${s}/></svg>`
    case 'chart':
      return `<svg class="feature-icon" viewBox="0 0 24 24"><path d="M4 19h16M7 15v-4M12 19v-9M17 13v-6" ${s}/></svg>`
    default:
      return ''
  }
}

function includedIcon(kind: 'news' | 'chart' | 'bell' | 'share' | 'code' | 'social'): string {
  const s = 'stroke="currentColor" stroke-width="1.65" fill="none" stroke-linecap="round" stroke-linejoin="round"'
  switch (kind) {
    case 'news':
      return `<svg class="included-icon" viewBox="0 0 24 24"><path d="M6 4h11a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H6V4Z" ${s}/><path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h1" ${s}/><path d="M9 8h6M9 12h6M9 16h4" ${s}/></svg>`
    case 'chart':
      return `<svg class="included-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" ${s}/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" ${s}/></svg>`
    case 'bell':
      return `<svg class="included-icon" viewBox="0 0 24 24"><path d="M14 18a2 2 0 1 1-4 0M7 9a5 5 0 0 1 10 0c0 5 2 5 2 7H5c0-2 2-2 2-7" ${s}/></svg>`
    case 'share':
      return `<svg class="included-icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" ${s}/><circle cx="6" cy="12" r="3" ${s}/><circle cx="18" cy="19" r="3" ${s}/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" ${s}/></svg>`
    case 'code':
      return `<svg class="included-icon" viewBox="0 0 24 24"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" ${s}/></svg>`
    case 'social':
      return `<svg class="included-icon" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" ${s}/><path d="M8 19v2M16 19v2M9 9h6M9 13h4" ${s}/></svg>`
    default:
      return ''
  }
}

/** Ícones brancos dentro do círculo colorido do card de escopo */
function scopeCategoryIcon(kind: 'building' | 'people' | 'target'): string {
  const s =
    'stroke="currentColor" stroke-width="1.65" fill="none" stroke-linecap="round" stroke-linejoin="round"'
  switch (kind) {
    case 'building':
      return `<svg class="scope-card__glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21h16M6 21V9l6-3.5L18 9v12M10 21v-5h4v5M10 13h4" ${s}/></svg>`
    case 'people':
      return `<svg class="scope-card__glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3.5" ${s}/><path d="M4 20.5v-.5a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v.5" ${s}/><circle cx="17" cy="8.5" r="2.8" ${s}/><path d="M21 20.5v-.5a3.8 3.8 0 0 0-3.3-3.7" ${s}/></svg>`
    case 'target':
      return `<svg class="scope-card__glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" ${s}/><circle cx="12" cy="12" r="3.2" ${s}/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" ${s}/></svg>`
    default:
      return ''
  }
}

const SCOPE_ICON_BY_SECTION: Record<SectionKey, 'building' | 'people' | 'target'> = {
  brands: 'building',
  competitors: 'people',
  sector: 'target',
}

/** Ícones da seção "Por que escolher" (contorno azul) */
function whyIcon(kind: 'shieldCheck' | 'globe' | 'userPlus' | 'lock'): string {
  const s =
    'stroke="currentColor" stroke-width="1.65" fill="none" stroke-linecap="round" stroke-linejoin="round"'
  switch (kind) {
    case 'shieldCheck':
      return `<svg class="why-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v6c0 5 3 9 7 10 4-1 7-5 7-10V6l-7-3Z" ${s}/><path d="m9 12 2 2 4-4" ${s}/></svg>`
    case 'globe':
      return `<svg class="why-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" ${s}/><path d="M3 12h18M12 3a16 16 0 0 1 0 18M12 3a16 16 0 0 0 0 18" ${s}/></svg>`
    case 'userPlus':
      return `<svg class="why-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" ${s}/><path d="M4 20.5v-.5a5 5 0 0 1 5-5h1.5" ${s}/><path d="M18 8v6M15 11h6" ${s}/></svg>`
    case 'lock':
      return `<svg class="why-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11V8a4 4 0 0 1 8 0v3" ${s}/><rect x="6" y="11" width="12" height="10" rx="2" ${s}/><path d="M12 15v2" ${s}/></svg>`
    default:
      return ''
  }
}

/** Monitor ao lado do título "Próximos passos" no rodapé (contorno magenta) */
function footerNextStepsTitleIcon(): string {
  const s =
    'stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"'
  return `<svg class="footer-title-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" ${s}/><path d="M8 20h8M12 16v4" ${s}/></svg>`
}

function buildScopeCard(
  key: SectionKey,
  input: CalculationInput,
  accent: 'brand' | 'magenta' | 'cyan',
): string {
  const section = input.sections[key]
  const services = collectSectionServices(section)
  const glyph = scopeCategoryIcon(SCOPE_ICON_BY_SECTION[key])
  const keywords = section.keywords.length
    ? section.keywords
      .map(
        (keyword) =>
          `<span class="scope-card__keyword">${escapeHtml(keyword)}</span>`,
      )
      .join('')
    : '<span class="scope-card__keyword scope-card__keyword--muted">Não informado</span>'

  const serviceTags = services.length
    ? services
      .map((service) => `<span class="scope-card__service-tag">${escapeHtml(service)}</span>`)
      .join('')
    : '<span class="scope-card__service-tag scope-card__service-tag--muted">A definir</span>'

  return `
    <article class="scope-card">
      <div class="scope-card__head">
        <div class="scope-card__icon-wrap scope-card__icon-wrap--${accent}" aria-hidden="true">
          ${glyph}
        </div>
        <div class="scope-card__head-text">
          <h3 class="scope-card__title">${escapeHtml(SECTION_LABELS[key].toUpperCase())}</h3>
          <div class="scope-card__field-label">Palavras-chave</div>
          <div class="scope-card__keywords">${keywords}</div>
        </div>
      </div>
      <div class="scope-card__field-label">Volume estimado</div>
      <div class="scope-card__stat-value">${escapeHtml(formatInteger(section.volume))}</div>
      <div class="scope-card__stat-sub">notícias / mês</div>
      <div class="scope-card__divider"></div>
      <div class="scope-card__field-label">Serviços aplicados</div>
      <div class="scope-card__service-tags">${serviceTags}</div>
    </article>
  `
}

function buildCompositionBlocks(
  input: CalculationInput,
  calc: CalculationResult,
): CompositionBlock[] {
  const blocks: CompositionBlock[] = []

  blocks.push({
    sectionTitle: null,
    lines: [
      {
        label: 'Preço base mensal',
        value: formatCurrency(calc.breakdownGroups.baseMonthlyPrice),
      },
    ],
  })

  const matterDetails = buildMatterDetails(calc)
  if (matterDetails.length > 0) {
    blocks.push({
      sectionTitle: 'Serviços de monitoramento',
      lines: matterDetails.map((d) => ({ label: d.label, value: d.value })),
    })
  }

  const addLabels = buildAdditionalsLabels(input.additionals)
  if (calc.breakdownGroups.additionalServices > 0) {
    const lines: CompositionLine[] = addLabels.map((r) => ({ label: r.label, value: '' }))
    lines.push({
      label: 'Total serviços adicionais',
      value: formatCurrency(calc.breakdownGroups.additionalServices),
    })
    blocks.push({ sectionTitle: 'Serviços adicionais', lines })
  }

  const reportLabels = buildReportsLabels(input.reports)
  if (calc.breakdownGroups.reportsBi > 0) {
    const lines: CompositionLine[] = reportLabels.map((r) => ({ label: r.label, value: '' }))
    lines.push({
      label: 'Total relatórios e BI',
      value: formatCurrency(calc.breakdownGroups.reportsBi),
    })
    blocks.push({ sectionTitle: 'Relatórios e BI', lines })
  }

  if (calc.onCallSurchargeAmount > 0) {
    blocks.push({
      sectionTitle: null,
      lines: [
        {
          label: `Acréscimos · Plantão (+${calc.onCallPercent}%)`,
          value: `+ ${formatCurrency(calc.onCallSurchargeAmount)}`,
          rowClass: 'comp-line--increase',
        },
      ],
    })
  }
  if (calc.autoApprovalDiscountAmount < 0) {
    blocks.push({
      sectionTitle: null,
      lines: [
        {
          label: `Descontos · Aprovação automática (−${calc.autoApprovalDiscountPercent}%)`,
          value: `− ${formatCurrency(Math.abs(calc.autoApprovalDiscountAmount))}`,
          rowClass: 'comp-line--discount',
        },
      ],
    })
  }
  if (calc.totalDiscountAmount < 0 && calc.totalDiscountPercent > 0) {
    blocks.push({
      sectionTitle: null,
      lines: [
        {
          label: `Descontos · Negociação na proposta (−${calc.totalDiscountPercent}%)`,
          value: `− ${formatCurrency(Math.abs(calc.totalDiscountAmount))}`,
          rowClass: 'comp-line--discount',
        },
      ],
    })
  }

  return blocks
}

function renderCompositionFlatLine(line: CompositionLine): string {
  const rowCls = line.rowClass ? ` ${line.rowClass}` : ''
  const amount = line.value.trim()
    ? `<span class="comp-flat__amount">${escapeHtml(line.value)}</span>`
    : ''
  return `
    <div class="comp-flat-row${rowCls}">
      <span class="comp-flat__label">${escapeHtml(line.label)}</span>
      ${amount}
    </div>`
}

function renderCompositionTreeLine(line: CompositionLine): string {
  const isSubtotal = line.label.startsWith('Total ')
  const subCls = isSubtotal ? ' comp-tree-row--subtotal' : ''
  const rowCls = line.rowClass ? ` ${line.rowClass}` : ''
  const amount = line.value.trim()
    ? `<span class="comp-tree-row__amount">${escapeHtml(line.value)}</span>`
    : '<span class="comp-tree-row__amount comp-tree-row__amount--empty"></span>'
  return `
    <div class="comp-tree-row${subCls}${rowCls}">
      <span class="comp-tree-row__label">${escapeHtml(line.label)}</span>
      ${amount}
    </div>`
}

function renderCompositionBlocksHtml(blocks: CompositionBlock[]): string {
  return blocks
    .map((block) => {
      if (block.sectionTitle === null) {
        return `<div class="comp-block comp-block--flat">${block.lines.map(renderCompositionFlatLine).join('')}</div>`
      }
      return `
        <div class="comp-block comp-block--section">
          <div class="comp-section-head">${escapeHtml(block.sectionTitle)}</div>
          <div class="comp-tree" role="group">
            ${block.lines.map(renderCompositionTreeLine).join('')}
          </div>
        </div>`
    })
    .map((html) => `${html}\n<div class="comp-panel-divider" aria-hidden="true"></div>`)
    .join('')
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

  const contactEmail = options?.contactEmail?.trim() || 'comercial@cservice.com.br'
  const contactPhone = options?.contactPhone?.trim() || '+55 (11) 4000-0000'

  const distribution = buildDistributionRows(input)
  const compositionBlocks = buildCompositionBlocks(input, calc)
  const compositionBlocksHtml = renderCompositionBlocksHtml(compositionBlocks)

  const headerBannerCssUrl = escapeCssSingleQuotedString(
    resolveEmbeddedAssetCssUrl(proposalHeaderBannerUrl),
  )

  const distributionHtml = distribution
    .map(
      (row) => `
        <div class="distribution-row">
          ${iconSvg(row.icon)}
          <div>
            <div class="distribution-row__title">${escapeHtml(row.title)}</div>
            <div class="distribution-row__body">${escapeHtml(row.body)}</div>
          </div>
        </div>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposta comercial · CService</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      color-scheme: light;
      --proposal-header-banner: url('${headerBannerCssUrl}');
      --navy: #041a78;
      --navy-deep: #02124d;
      --ink: #17223f;
      --ink-soft: #5f6b86;
      --muted: #666666;
      --line: #e5e8f0;
      --surface: #ffffff;
      --surface-soft: #f5f7fb;
      --brand: #007bff;
      --cyan: #00bcd4;
      --cyan-bright: #21d3f6;
      --magenta: #e91e63;
      --shadow: 0 18px 44px rgba(4, 26, 120, 0.1);
    }

    * { box-sizing: border-box; }

    .proposal-shell strong {
      font-weight: 500;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #eef2f8;
      color: var(--ink);
      font-family: Montserrat, "Segoe UI", system-ui, sans-serif;
    }

    body { padding: 28px 18px 40px; }

    .proposal-shell {
      max-width: 980px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid #dbe3f0;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    /* Faixa do banner (PNG já inclui logo CSERVICE) */
    .section-header-banner {
      width: 100%;
      height: 88px;
      flex-shrink: 0;
      background-color: var(--navy);
      background-image: var(--proposal-header-banner);
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
    }

    /* ---- Top bar ---- */
    .proposal-topbar {
      height: 96px;
      background-color: var(--navy);
      background-image: var(--proposal-header-banner);
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
    }

    /* ---- Hero ---- */
    .intro {
      display: flex;
      flex-direction: column;
      padding: 0;
      background: #fff;
      border-bottom: 1px solid var(--line);
    }

    .intro__columns {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
      gap: 28px;
      padding: 28px 34px 22px;
      align-items: start;
    }

    .intro__title {
      margin: 0 0 8px;
      font-size: 30px;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: var(--navy);
      text-transform: uppercase;
    }
    .intro__eyebrow {
      margin: 0 0 14px;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--cyan-bright);
    }
    .intro__lead {
      margin: 0;
      font-size: 13px;
      line-height: 1.65;
      color: var(--muted);
      max-width: 46ch;
    }

    .intro__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 28px 40px;
      margin-top: 26px;
    }
    .meta-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 200px;
    }
    .meta-icon {
      width: 22px;
      height: 22px;
      color: var(--cyan-bright);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .meta-item__label {
      display: block;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #8893ad;
    }
    .meta-item__value {
      display: block;
      margin-top: 4px;
      font-size: 14px;
      font-weight: 500;
      color: var(--navy);
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

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        height: 4px;
        background: linear-gradient(90deg, var(--cyan) 0%, var(--brand) 54%, var(--magenta) 100%);
      }
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

    /* ---- Sections ---- */
    .content-section {
      padding: 22px 34px 26px;
      border-top: 1px solid var(--line);
      background: #fff;
    }

    .section-heading {
      margin: 0 0 18px;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--navy);
    }
    .section-heading--escopo {
      color: #002d72;
      font-size: 15px;
      letter-spacing: 0.08em;
    }
    .section-heading--center {
      text-align: center;
    }

    /* Resumo executive */
    .exec-section {
      padding: 28px 34px 15px;
    }
    .exec-section .section-header-banner {
      width: calc(100% + 68px);
      margin-left: -34px;
      margin-right: -34px;
      margin-bottom: 22px;
    }

    .exec-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
      gap: 28px;
      align-items: start;
    }
    .exec-doc-icon {
      width: 28px;
      height: 28px;
      color: var(--cyan-bright);
      flex-shrink: 0;
    }
    .exec-head {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .exec-title {
      margin: 0;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--navy);
    }
    .exec-text {
      margin: 0 0 12px;
      font-size: 12.5px;
      line-height: 1.65;
      color: var(--muted);
    }
    .exec-text:last-child { margin-bottom: 0; }

    .exec-features {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .exec-feature {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .feature-icon {
      width: 26px;
      height: 26px;
      color: var(--brand);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .exec-feature__title {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 500;
      color: var(--navy);
    }
    .exec-feature__desc {
      margin: 0;
      font-size: 11.5px;
      line-height: 1.5;
      color: var(--ink-soft);
    }

    /* Escopo — cards compactos */
    .scope-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .scope-card {
      padding: 14px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      background: #fff;
      min-height: 100%;
      text-align: left;
    }
    .scope-card__head {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 12px;
    }
    .scope-card__icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      color: #fff;
    }
    .scope-card__icon-wrap--brand { background: #2e5bff; }
    .scope-card__icon-wrap--magenta { background: #e91e8c; }
    .scope-card__icon-wrap--cyan { background: #00bcd4; }
    .scope-card__glyph {
      width: 18px;
      height: 18px;
      display: block;
    }
    .scope-card__head-text { min-width: 0; flex: 1; }
    .scope-card__title {
      margin: 0 0 5px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: #002d72;
      line-height: 1.2;
    }
    .scope-card__field-label {
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #8e9aa0;
      margin-bottom: 5px;
    }
    .scope-card__keywords {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .scope-card__keyword {
      padding: 3px 8px;
      border-radius: 999px;
      background: #f0f2f5;
      font-size: 10px;
      font-weight: 500;
      color: #4a5568;
    background: #fcfcfc;
    border: 1px solid #e6e6e6;
    }
    .scope-card__keyword--muted {
      background: #f0f2f5;
      color: #8e9aa0;
    }
    .scope-card__stat-value {
      font-size: 26px;
      font-weight: 500;
      line-height: 1;
      margin-bottom: 3px;
      color: #2e5bff;
    }
    .scope-card__stat-sub {
      font-size: 10px;
      font-weight: 500;
      color: #8e9aa0;
      margin-bottom: 10px;
    }
    .scope-card__divider {
      height: 1px;
      margin: 0 0 10px;
      background: #e0e0e0;
    }
    .scope-card__service-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .scope-card__service-tag {
    padding: 3px 8px;
    border-radius: 999px;
    background: #fcfcfc;
    border: 1px solid #e6e6e6;
    font-size: 10px;
    font-weight: 500;
    color: #4a5568;
}
    .scope-card__service-tag--muted {
      color: #8e9aa0;
    }

    /* Serviços incluídos */
    .included-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px 18px;
    }
    .included-card {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 10px 4px;
    }
    .included-icon {
      width: 28px;
      height: 28px;
      color: var(--brand);
      flex-shrink: 0;
    }
    .included-card__title {
      margin: 0 0 5px;
      font-size: 13px;
      font-weight: 500;
      color: var(--navy);
    }
    .included-card__desc {
      margin: 0;
      font-size: 11px;
      line-height: 1.5;
      color: var(--ink-soft);
    }

    /* Distribuição + composição */
    .dual-column {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
      gap: 32px;
      align-items: start;
    }
    .dual-column__heading {
      margin: 0 0 16px;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--navy);
    }
    .distribution-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .distribution-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .dist-icon {
      width: 22px;
      height: 22px;
      color: var(--cyan-bright);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .distribution-row__title {
      font-size: 12px;
      font-weight: 500;
      color: var(--navy);
      margin-bottom: 4px;
    }
    .distribution-row__body {
      font-size: 11.5px;
      line-height: 1.55;
      color: var(--muted);
    }

    .composition-panel {
      border: 1px solid #e3e6ea;
      border-radius: 10px;
      padding: 22px 22px 18px;
      background: #fff;
    }
    .composition-panel__title {
      margin: 0 0 14px;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: #002d72;
    }
    .composition-panel__title-rule {
      height: 1px;
      margin: 0 0 18px;
      background: #e8eaed;
    }
    .composition-panel__body {
      margin: 0;
      padding: 0;
    }

    .comp-block { margin: 0; }
    .comp-block--section { margin-top: 4px; }
    .comp-section-head {
      font-size: 13px;
      font-weight: 500;
      color: #5c6778;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    .comp-panel-divider {
      height: 1px;
      margin: 14px 0;
      background: #e8eaed;
    }

    .comp-flat-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 16px;
      align-items: baseline;
      padding: 6px 0;
    }
    .comp-flat__label {
      font-size: 13px;
      font-weight: 500;
      color: #5c6778;
    }
    .comp-flat__amount {
      font-size: 13px;
      font-weight: 500;
      color: #1a202c;
      white-space: nowrap;
      text-align: right;
    }
    .comp-flat-row.comp-line--increase .comp-flat__label,
    .comp-flat-row.comp-line--increase .comp-flat__amount {
      color: #2d8659;
      font-weight: 500;
    }
    .comp-flat-row.comp-line--discount .comp-flat__label,
    .comp-flat-row.comp-line--discount .comp-flat__amount {
      color: #b45348;
      font-weight: 500;
    }

    /* Árvore: linha vertical + ramos à esquerda */
    .comp-tree {
      margin: 0;
      padding: 2px 0 4px 14px;
      border-left: 1px solid #dde1e7;
    }
    .comp-tree-row {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 14px;
      align-items: baseline;
      padding: 5px 0 5px 14px;
    }
    .comp-tree-row::before {
      content: "";
      position: absolute;
      left: -15px;
      top: 50%;
      width: 12px;
      height: 1px;
      background: #dde1e7;
    }
    .comp-tree-row__label {
      font-size: 11.5px;
      font-weight: 500;
      color: #8e9aa0;
      line-height: 1.35;
    }
    .comp-tree-row__amount {
      font-size: 12px;
      font-weight: 500;
      color: #2d3748;
      white-space: nowrap;
      text-align: right;
    }
    .comp-tree-row__amount--empty {
      font-weight: 500;
      color: transparent;
    }
    .comp-tree-row--subtotal .comp-tree-row__label {
      font-size: 12px;
      font-weight: 500;
      color: #5c6778;
    }
    .comp-tree-row--subtotal .comp-tree-row__amount {
      font-size: 12px;
      font-weight: 500;
      color: #1a202c;
    }
    .comp-tree-row.comp-line--increase .comp-tree-row__label,
    .comp-tree-row.comp-line--increase .comp-tree-row__amount {
      color: #2d8659;
    }
    .comp-tree-row.comp-line--discount .comp-tree-row__label,
    .comp-tree-row.comp-line--discount .comp-tree-row__amount {
      color: #b45348;
    }

    .investment-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
      padding: 14px 16px;
      background: #e8f2ff;
      border-radius: 8px;
      border: 1px solid #d4e5fc;
    }
    .investment-total__label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #2563eb;
    }
    .investment-total__value {
      font-size: 19px;
      font-weight: 500;
      color: #1d4ed8;
      letter-spacing: normal;
      text-transform: none;
    }

    /* Por que escolher — grade 4 col., compacto */
    .why-section-heading {
      margin: 0 0 14px;
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.06em;
      line-height: 1.3;
      text-transform: uppercase;
    }
    .why-section-heading__prefix,
    .why-section-heading__suffix {
      color: #002d72;
    }
    .why-section-heading__brand {
      color: #48d1e0;
    }

    .why-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px 12px;
      max-width: none;
      margin: 0;
      padding: 0;
    }
    .why-card {
      text-align: center;
      padding: 6px 4px;
    }
    .why-icon {
      width: 30px;
      height: 30px;
      color: #2e5bff;
      margin: 0 auto 8px;
      display: block;
    }
    .why-card__title {
      margin: 0 0 5px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: #002d72;
      text-transform: none;
    }
    .why-card__desc {
      margin: 0;
      font-size: 10px;
      line-height: 1.45;
      color: #6b7280;
      font-weight: 500;
    }

    /* Footer — navy profundo, ciano nos títulos, magenta nos ícones, blobs */
    .footer-wrap {
      background: #001061;
      position: relative;
      overflow: hidden;
    }
    .footer-decor {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    .footer-decor__blob {
      position: absolute;
      border-radius: 50%;
    }
    .footer-decor__blob--bl {
      left: -56px;
      bottom: -56px;
      width: 148px;
      height: 148px;
      background: radial-gradient(circle, rgba(72, 209, 224, 0.45) 0%, rgba(72, 209, 224, 0.08) 65%, transparent 70%);
    }
    .footer-decor__blob--br-magenta {
      right: -48px;
      bottom: -52px;
      width: 168px;
      height: 168px;
      background: radial-gradient(circle, rgba(233, 30, 99, 0.42) 0%, rgba(233, 30, 99, 0.1) 62%, transparent 72%);
    }
    .footer-decor__blob--br-cyan {
      right: 32px;
      bottom: -72px;
      width: 132px;
      height: 132px;
      background: radial-gradient(circle, rgba(72, 209, 224, 0.38) 0%, rgba(72, 209, 224, 0.06) 62%, transparent 72%);
    }

    .footer-band {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 32px;
      padding: 28px 34px 32px;
      color: #fff;
    }
    .footer-panel__title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 12px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #48d1e0;
    }
    .footer-panel__title--plain {
      display: block;
    }
    .footer-title-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      color: #e91e63;
    }
    .footer-panel__text {
      margin: 0;
      font-size: 11.5px;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.95);
      max-width: 44ch;
    }
    .footer-contact-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 10px;
      font-size: 11.5px;
      color: rgba(255, 255, 255, 0.96);
    }
    .footer-contact-row:first-of-type {
      margin-top: 14px;
    }
    .footer-contact-icon {
      width: 18px;
      height: 18px;
      color: #e91e63;
      flex-shrink: 0;
      margin-top: 1px;
    }

    @media (max-width: 1024px) {
      .why-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @page { size: A4; margin: 0; }
    @media print {
      body { padding: 0; background: #fff; }
      .proposal-shell { box-shadow: none; border: none; }
    }
    @media (max-width: 820px) {
      .intro__columns { grid-template-columns: 1fr; }
      .exec-grid { grid-template-columns: 1fr; }
      .scope-grid { grid-template-columns: 1fr; }
      .included-grid { grid-template-columns: 1fr 1fr; }
      .dual-column { grid-template-columns: 1fr; }
      .why-grid { grid-template-columns: 1fr; }
      .footer-band { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="proposal-shell">
    <header class="proposal-topbar" aria-label="CService"></header>

    <section class="intro">
      <div class="intro__columns">
      <div>
        <h1 class="intro__title">Proposta comercial</h1>
        <p class="intro__eyebrow">Monitoramento de mídia</p>
        <p class="intro__lead">
          Monitoramento inteligente para transformar menções em decisões: cobertura multicanal,
          curadoria especializada e entregas que acompanham o ritmo do seu negócio.
        </p>

        <div class="intro__meta">
          <div class="meta-item">
            ${metaIcon('calendar')}
            <div>
              <span class="meta-item__label">Data da proposta</span>
              <span class="meta-item__value">${escapeHtml(formatLongDateUppercase(generatedAt))}</span>
            </div>
          </div>
          <div class="meta-item">
            ${metaIcon('user')}
            <div>
              <span class="meta-item__label">Proposta para</span>
              <span class="meta-item__value">${escapeHtml(clientName.toUpperCase())}</span>
            </div>
          </div>
        </div>
      </div>

      <aside class="price-card">
        <p class="price-card__label">Investimento mensal</p>
        <p class="price-card__value">${escapeHtml(formatCurrency(calc.finalPrice))}</p>
        <p class="price-card__hint">por mês</p>
      </aside>
      </div>
    </section>

    <section class="content-section exec-section">
      <div class="exec-grid">
        <div>
          <div class="exec-head">
            <svg class="exec-doc-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M10 13h8M10 17h8M10 9h4" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round"/></svg>
            <h2 class="exec-title">Resumo executive</h2>
          </div>
          <p class="exec-text">
            Esta proposta consolida o escopo de monitoramento de marcas, concorrentes e tendências de setor,
            com entrega contínua de conteúdo curado e métricas para suportar comunicação e estratégia.
          </p>
          <p class="exec-text">
            A solução integra coleta automatizada, triagem editorial e camadas opcionais de análise — mantendo
            visibilidade sobre riscos, oportunidades e narrativas relevantes para sua organização.
          </p>
        </div>
        <div class="exec-features">
          <div class="exec-feature">
            ${featureIcon('monitor')}
            <div>
              <div class="exec-feature__title">Monitoramento 24/7</div>
              <p class="exec-feature__desc">Captação contínua de menções em veículos relevantes, com fluxo estável para sua equipe.</p>
            </div>
          </div>
          <div class="exec-feature">
            ${featureIcon('brain')}
            <div>
              <div class="exec-feature__title">Inteligência artificial</div>
              <p class="exec-feature__desc">Enriquecimento e classificação assistidos por modelos treinados para o contexto de mídia.</p>
            </div>
          </div>
          <div class="exec-feature">
            ${featureIcon('bell')}
            <div>
              <div class="exec-feature__title">Alertas em tempo real</div>
              <p class="exec-feature__desc">Notificações configuráveis para crises, picos de volume e temas prioritários.</p>
            </div>
          </div>
          <div class="exec-feature">
            ${featureIcon('chart')}
            <div>
              <div class="exec-feature__title">Relatórios inteligentes</div>
              <p class="exec-feature__desc">Sínteses executivas e distribuição formatada para diferentes públicos internos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2 class="section-heading section-heading--escopo">Escopo do monitoramento</h2>
      <div class="scope-grid">
        ${buildScopeCard('brands', input, 'brand')}
        ${buildScopeCard('competitors', input, 'magenta')}
        ${buildScopeCard('sector', input, 'cyan')}
      </div>
    </section>

    <section class="content-section">
      <h2 class="section-heading">Serviços incluídos</h2>
      <div class="included-grid">
        <div class="included-card">
          ${includedIcon('news')}
          <div>
            <div class="included-card__title">Coleta de notícias</div>
            <p class="included-card__desc">Varredura editorial ampla com foco em veículos alinhados ao seu perfil de interesse.</p>
          </div>
        </div>
        <div class="included-card">
          ${includedIcon('chart')}
          <div>
            <div class="included-card__title">Análise e classificação</div>
            <p class="included-card__desc">Camadas de leitura para organizar volume, relevância e polaridade das menções.</p>
          </div>
        </div>
        <div class="included-card">
          ${includedIcon('bell')}
          <div>
            <div class="included-card__title">Alertas inteligentes</div>
            <p class="included-card__desc">Gatilhos automáticos para acompanhar crises e assuntos sensíveis.</p>
          </div>
        </div>
        <div class="included-card">
          ${includedIcon('share')}
          <div>
            <div class="included-card__title">Relatórios e distribuição</div>
            <p class="included-card__desc">Entregas periódicas e rotinas de compartilhamento com stakeholders.</p>
          </div>
        </div>
        <div class="included-card">
          ${includedIcon('code')}
          <div>
            <div class="included-card__title">API de dados</div>
            <p class="included-card__desc">Integração opcional para consumir conteúdos curados em seus sistemas.</p>
          </div>
        </div>
        <div class="included-card">
          ${includedIcon('social')}
          <div>
            <div class="included-card__title">Mídias sociais</div>
            <p class="included-card__desc">Extensão do monitoramento para conversas e narrativas relevantes nas redes.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="dual-column">
        <div>
          <h3 class="dual-column__heading">Distribuição e entrega</h3>
          <div class="distribution-stack">
            ${distributionHtml}
          </div>
        </div>
        <div>
          <div class="composition-panel">
            <h3 class="composition-panel__title">Composição do investimento</h3>
            <div class="composition-panel__title-rule" aria-hidden="true"></div>
            <div class="composition-panel__body">
              ${compositionBlocksHtml}
            </div>
            <div class="investment-total">
              <span class="investment-total__label">Investimento mensal total</span>
              <strong class="investment-total__value">${escapeHtml(formatCurrency(calc.finalPrice))}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2 class="why-section-heading">
        <span class="why-section-heading__prefix">Por que escolher a </span><span class="why-section-heading__brand">CSERVICE</span><span class="why-section-heading__suffix">?</span>
      </h2>
      <div class="why-grid">
        <div class="why-card">
          ${whyIcon('shieldCheck')}
          <div class="why-card__title">Tecnologia avançada</div>
          <p class="why-card__desc">IA e automação para entregar informações com precisão e agilidade.</p>
        </div>
        <div class="why-card">
          ${whyIcon('globe')}
          <div class="why-card__title">Cobertura ampla</div>
          <p class="why-card__desc">Monitoramos milhares de fontes relevantes em todo o país e no mundo.</p>
        </div>
        <div class="why-card">
          ${whyIcon('userPlus')}
          <div class="why-card__title">Especialistas de verdade</div>
          <p class="why-card__desc">Equipe experiente que transforma dados em insights acionáveis para o seu negócio.</p>
        </div>
        <div class="why-card">
          ${whyIcon('lock')}
          <div class="why-card__title">Segurança e confidencialidade</div>
          <p class="why-card__desc">Seus dados protegidos com os mais altos padrões de segurança da informação.</p>
        </div>
      </div>
    </section>

    <div class="footer-wrap">
      <div class="footer-decor" aria-hidden="true">
        <div class="footer-decor__blob footer-decor__blob--bl"></div>
        <div class="footer-decor__blob footer-decor__blob--br-magenta"></div>
        <div class="footer-decor__blob footer-decor__blob--br-cyan"></div>
      </div>
      <footer class="footer-band">
        <section class="footer-panel">
          <h2 class="footer-panel__title">
            ${footerNextStepsTitleIcon()}
            <span>Próximos passos</span>
          </h2>
          <p class="footer-panel__text">
            Para continuidade, basta confirmar a aprovação desta proposta. Após a confirmação,
            iniciamos o processo de implementação em até 2 dias úteis.
          </p>
        </section>
        <section class="footer-panel">
          <h2 class="footer-panel__title footer-panel__title--plain">Dúvidas?</h2>
          <p class="footer-panel__text">
            Estou à disposição para qualquer esclarecimento.
          </p>
          <div class="footer-contact-row">
            <svg class="footer-contact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="1.75" fill="none"/><path d="m22 6-10 7L2 6" stroke="currentColor" stroke-width="1.75" fill="none"/></svg>
            <span>${escapeHtml(contactEmail)}</span>
          </div>
          <div class="footer-contact-row">
            <svg class="footer-contact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.6 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.17a2 2 0 0 1 2.11-.45c.8.28 1.64.48 2.5.6A2 2 0 0 1 22 16.9Z" stroke="currentColor" stroke-width="1.75" fill="none"/></svg>
            <span>${escapeHtml(contactPhone)}</span>
          </div>
        </section>
      </footer>
    </div>
  </main>
</body>
</html>`
}
