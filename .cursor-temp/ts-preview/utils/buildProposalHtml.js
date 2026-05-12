import { MONITORING_LABELS, SECTION_LABELS } from '../domain/prices';
import { MONITORING_SERVICE_KEYS, SECTION_KEYS } from '../domain/types';
import { formatCurrency } from './currency';
function escapeHtml(s) {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
function formatInteger(value) {
    return new Intl.NumberFormat('pt-BR').format(Math.max(0, Math.round(value)));
}
function formatLongDate(value) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(value);
}
function summarizeList(items, max = 2, empty = 'Não informado') {
    if (!items.length)
        return empty;
    return items.slice(0, max).join(', ');
}
function buildKeywordsFallback(input) {
    for (const key of SECTION_KEYS) {
        const first = input.sections[key].keywords[0]?.trim();
        if (first)
            return first;
    }
    return 'Cliente';
}
function resolveClientName(input, options) {
    return options?.meta?.clientName?.trim() || buildKeywordsFallback(input);
}
function collectSectionServices(section) {
    return MONITORING_SERVICE_KEYS.filter((key) => section.services[key]).map((key) => MONITORING_LABELS[key]);
}
function resolveScopeFocus(input) {
    const activeLabels = SECTION_KEYS.filter((key) => input.sections[key].keywords.length > 0).map((key) => SECTION_LABELS[key].toLowerCase());
    if (!activeLabels.length)
        return 'marcas, concorrentes e setor';
    if (activeLabels.length === 1)
        return activeLabels[0];
    if (activeLabels.length === 2)
        return `${activeLabels[0]} e ${activeLabels[1]}`;
    return `${activeLabels.slice(0, -1).join(', ')} e ${activeLabels.at(-1)}`;
}
function renderIcon(kind) {
    switch (kind) {
        case 'calendar':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"></rect><path d="M7 3.5v3M17 3.5v3M3.5 9.5h17"></path></svg>';
        case 'user':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z"></path><path d="M5 20a7 7 0 0 1 14 0"></path></svg>';
        case 'document':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5a1.5 1.5 0 0 1 1-1.4Z"></path><path d="M14 3.5V8h4M9 12h6M9 15h6"></path></svg>';
        case 'monitor':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="11.5" rx="2.2"></rect><path d="M8 20h8M12 16v4"></path></svg>';
        case 'sparkles':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Zm7 10l.9 2.1L22 16l-2.1.9L19 19l-.9-2.1L16 16l2.1-.9L19 13ZM5 14l1 2.4L8.5 17 6 18l-1 2.5L4 18l-2.5-1L4 16.4 5 14Z"></path></svg>';
        case 'bell':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5a4 4 0 0 0-4 4v2.1c0 .8-.2 1.5-.7 2.2L5.8 15h12.4l-1.5-2.2a4 4 0 0 1-.7-2.2V8.5a4 4 0 0 0-4-4Z"></path><path d="M10 18a2 2 0 0 0 4 0"></path></svg>';
        case 'chart':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5h16"></path><path d="M7 16V9"></path><path d="M12 16V6"></path><path d="M17 16v-4"></path></svg>';
        case 'building':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V20"></path><path d="M9 8.5h1M14 8.5h1M9 12h1M14 12h1M11.5 20v-3.5h1V20"></path></svg>';
        case 'users':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7ZM17 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Z"></path><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 19a4 4 0 0 1 6.5-3.1"></path></svg>';
        case 'target':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5"></circle><circle cx="12" cy="12" r="3.5"></circle><path d="M12 2.5v3M21.5 12h-3M12 21.5v-3M2.5 12h3"></path></svg>';
        case 'news':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.2"></rect><path d="M8 9h8M8 12h8M8 15h5"></path></svg>';
        case 'camera':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7.5h2.2l1.2-1.8h3.2l1.2 1.8H17A2.5 2.5 0 0 1 19.5 10v6A2.5 2.5 0 0 1 17 18.5H7A2.5 2.5 0 0 1 4.5 16v-6A2.5 2.5 0 0 1 7 7.5Z"></path><circle cx="12" cy="13" r="3"></circle></svg>';
        case 'api':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6 4.5 12 8 18M16 6l3.5 6-3.5 6M13.5 4 10.5 20"></path></svg>';
        case 'mail':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2.2"></rect><path d="m4.5 8.5 7.5 5 7.5-5"></path></svg>';
        case 'team':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5ZM16.5 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Z"></path><path d="M3.5 18a4 4 0 0 1 8 0M12.5 18a4 4 0 0 1 8 0"></path></svg>';
        case 'file':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7 3.5Z"></path><path d="M14 3.5V8h4M9 12h6M9 15h4"></path></svg>';
        case 'cloud':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 18.5h8a4 4 0 0 0 .3-8a5.5 5.5 0 0 0-10.6 1.7A3.3 3.3 0 0 0 8.5 18.5Z"></path></svg>';
        case 'shield':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 18.5 6v5c0 4.1-2.3 7.8-6.5 9.5C7.8 18.8 5.5 15.1 5.5 11V6L12 3.5Z"></path><path d="m9.5 12 1.8 1.8 3.4-3.8"></path></svg>';
        case 'globe':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M3.8 12h16.4M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17"></path></svg>';
        case 'specialists':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7Z"></path><path d="M5 20a7 7 0 0 1 14 0"></path><path d="m18.5 7.5 1 2 2 .9-2 .9-1 2-.9-2-2-.9 2-.9.9-2Z"></path></svg>';
        case 'lock':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10" width="13" height="10" rx="2.2"></rect><path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2"></path></svg>';
        case 'email':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z"></path><path d="m4.5 8 7.5 5 7.5-5"></path></svg>';
        case 'phone':
            return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 4.5h2.7l1.1 4-2 1.2a14 14 0 0 0 5 5l1.2-2 4 1.1v2.7A1.8 1.8 0 0 1 17.7 20C10.6 20 4 13.4 4 6.3A1.8 1.8 0 0 1 5.8 4.5Z"></path></svg>';
    }
}
function renderFeatureCard(item, tone = 'default') {
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
  `;
}
function buildScopeCard(key, input, accent) {
    const section = input.sections[key];
    const services = collectSectionServices(section);
    return `
    <article class="scope-card">
      <div class="scope-card__head">
        <span class="scope-card__badge scope-card__badge--${accent}" aria-hidden="true">
          ${renderIcon(key === 'marcas' ? 'building' : key === 'concorrentes' ? 'users' : 'target')}
        </span>
        <div>
          <h3 class="scope-card__title">${escapeHtml(SECTION_LABELS[key].toUpperCase())}</h3>
          <p class="scope-card__summary">${escapeHtml(summarizeList(section.keywords))}</p>
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
        : '<span class="tag tag--muted">A definir</span>'}
      </div>
    </article>
  `;
}
function buildExecutiveSummary(clientName, input) {
    const focus = resolveScopeFocus(input);
    return `
    <p>Esta proposta contempla o monitoramento estratégico da marca ${escapeHtml(clientName)}, com foco em ${escapeHtml(focus)}, com coleta, análise e entrega de informações relevantes em tempo real.</p>
    <p>Nosso objetivo é transformar dados de mídia em inteligência para apoiar decisões e fortalecer sua presença no mercado.</p>
  `;
}
function buildServiceHighlights(input, calc) {
    const selected = new Set(calc.selectedMonitoringLabels);
    const items = [];
    if (calc.totalKeywords > 0 || calc.totalVolume > 0) {
        items.push({
            title: 'Coleta de notícias',
            description: 'Fontes online, portais, blogs e veículos.',
            icon: 'news',
        });
    }
    if (selected.has('IA') ||
        selected.has('Score') ||
        selected.has('Avaliação') ||
        selected.has('Grifo') ||
        selected.has('Centimetragem')) {
        items.push({
            title: 'Análise e classificação',
            description: 'IA para relevância, sentimento e contexto.',
            icon: 'sparkles',
        });
    }
    if (input.additionals.alertasWeb || input.operational.enviosDiarios > 0) {
        items.push({
            title: 'Alertas inteligentes',
            description: 'Notificações em tempo real por e-mail.',
            icon: 'bell',
        });
    }
    if (selected.has('Screenshot')) {
        items.push({
            title: 'Screenshot',
            description: 'Captura de imagens das notícias.',
            icon: 'camera',
        });
    }
    if (input.broadcast.relatorioEnabled || input.operational.enviosDiarios > 0) {
        items.push({
            title: 'Relatórios',
            description: 'Relatórios diários, semanais e mensais.',
            icon: 'chart',
        });
    }
    if (input.additionals.api) {
        items.push({
            title: 'API de dados',
            description: 'Integração para sistemas internos.',
            icon: 'api',
        });
    }
    if (input.additionals.midiasSociais) {
        items.push({
            title: 'Mídias sociais',
            description: 'Cobertura complementar de perfis e canais.',
            icon: 'monitor',
        });
    }
    if (input.broadcast.tvEnabled || input.broadcast.radioEnabled) {
        items.push({
            title: 'Broadcast',
            description: 'Cobertura complementar para TV e rádio.',
            icon: 'document',
        });
    }
    return items.slice(0, 6);
}
function buildDeliveryItems(input) {
    const reportLabel = input.broadcast.relatorioEnabled
        ? input.broadcast.relatorioFreq === 'semanal'
            ? 'relatório semanal'
            : 'relatório mensal'
        : null;
    const accessLabel = input.additionals.api
        ? 'Plataforma online e integração via API.'
        : 'Plataforma online com histórico e busca inteligente.';
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
    ];
}
function buildInstitutionalItems() {
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
    ];
}
function buildWhyChooseItems() {
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
    ];
}
export function buildProposalHtml(input, calc, options) {
    const clientName = resolveClientName(input, options);
    const generatedAt = options?.generatedAt
        ? new Date(options.generatedAt)
        : new Date();
    const investmentRows = [
        {
            label: 'Preço base mensal',
            value: formatCurrency(calc.breakdownGroups.precoBaseMensal),
        },
        {
            label: 'Serviços de monitoramento',
            value: formatCurrency(calc.breakdownGroups.servicosMonitoramento),
        },
        {
            label: 'Serviços adicionais',
            value: formatCurrency(calc.breakdownGroups.servicosAdicionais),
        },
        {
            label: 'Relatório analítico',
            value: formatCurrency(calc.breakdownGroups.relatorioAnalitico),
        },
    ];
    const institutionalItems = buildInstitutionalItems();
    const serviceHighlights = buildServiceHighlights(input, calc);
    const deliveryItems = buildDeliveryItems(input);
    const whyChooseItems = buildWhyChooseItems();
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposta comercial · CService</title>
  <style>
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
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 108px;
      padding: 24px 32px;
      background: var(--brand-strong);
      overflow: hidden;
    }

    .proposal-topbar::before,
    .proposal-topbar::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      pointer-events: none;
    }

    .proposal-topbar::before {
      width: 250px;
      height: 250px;
      left: -88px;
      top: -140px;
      background:
        radial-gradient(circle at 58% 58%, transparent 0 39%, var(--brand-strong) 39.5% 100%),
        linear-gradient(140deg, var(--cyan) 0%, var(--cyan) 64%, transparent 64% 100%);
      opacity: 0.92;
    }

    .proposal-topbar::after {
      width: 360px;
      height: 220px;
      right: -72px;
      top: -112px;
      background:
        radial-gradient(circle at 70% 40%, rgba(33, 211, 246, 0.95) 0 32%, transparent 33% 100%),
        radial-gradient(circle at 24% 72%, rgba(255, 11, 138, 0.95) 0 32%, transparent 33% 100%);
      opacity: 0.95;
    }

    .proposal-brand {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      color: #fff;
    }

    .proposal-brand__mark {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 999px;
      background: #fff;
      overflow: hidden;
    }

    .proposal-brand__mark::before,
    .proposal-brand__mark::after {
      content: "";
      position: absolute;
      border-radius: 999px;
    }

    .proposal-brand__mark::before {
      width: 26px;
      height: 52px;
      left: -2px;
      top: -4px;
      background: var(--brand-strong);
    }

    .proposal-brand__mark::after {
      width: 20px;
      height: 44px;
      right: 2px;
      top: 0;
      border-radius: 999px 999px 12px 12px;
      background: #22d2f5;
      transform: rotate(18deg);
    }

    .proposal-brand__word {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }

    .proposal-body {
      background: #fbfcff;
    }

    .intro {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.95fr);
      gap: 28px;
      padding: 26px 32px 22px;
      background: #fbfcff;
    }

    .intro__eyebrow {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.03em;
      color: #1fd0f3;
    }

    .intro__title {
      margin: 0 0 6px;
      font-size: 46px;
      font-weight: 800;
      letter-spacing: -0.055em;
      line-height: 0.98;
      color: #11245a;
    }

    .intro__lead {
      margin: 0;
      max-width: 40ch;
      font-size: 15px;
      line-height: 1.55;
      color: var(--ink-soft);
    }

    .intro__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 26px;
      margin-top: 22px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .meta-item__icon {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: #f0f5ff;
      color: var(--brand);
      border: 1px solid #deebff;
    }

    .meta-item__icon svg,
    .feature-card__icon svg,
    .scope-card__badge svg,
    .contact-line__icon svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .meta-item__label {
      display: block;
      margin-bottom: 3px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #7e8ba6;
    }

    .meta-item__value {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #1b2a54;
    }

    .price-card {
      position: relative;
      align-self: start;
      padding: 18px 24px 22px;
      border: 1px solid #dce5f4;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 14px 30px rgba(10, 43, 140, 0.09);
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
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #46526c;
    }

    .price-card__value {
      margin: 14px 0 6px;
      font-size: 60px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.07em;
      color: var(--brand);
    }

    .price-card__hint {
      margin: 0;
      font-size: 15px;
      color: #5b6781;
    }

    .content-section {
      padding: 20px 32px;
      border-top: 1px solid var(--line);
      background: #fff;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
      gap: 28px;
      align-items: start;
    }

    .section-heading {
      margin: 0 0 14px;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #11245a;
      text-transform: uppercase;
    }

    .section-heading--inline {
      margin-bottom: 18px;
      font-size: 24px;
    }

    .executive-card {
      display: flex;
      gap: 16px;
      min-width: 0;
    }

    .executive-card__icon {
      width: 52px;
      height: 52px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: #eef4ff;
      color: var(--brand);
      border: 1px solid #dae6ff;
    }

    .executive-card__icon svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .executive-card__title {
      margin: 2px 0 10px;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #16285c;
      text-transform: uppercase;
    }

    .executive-card p {
      margin: 0 0 10px;
      color: #5d6780;
      font-size: 14px;
      line-height: 1.6;
    }

    .feature-column {
      display: grid;
      gap: 14px;
      align-content: start;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 16px;
    }

    .feature-grid--four {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .feature-grid--two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px 18px;
    }

    .feature-card {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      min-width: 0;
    }

    .feature-card__icon {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: #f3f7ff;
      color: var(--brand);
      border: 1px solid #e0e9fb;
    }

    .feature-card--soft .feature-card__icon {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      background: #f6f9ff;
    }

    .feature-card__title {
      display: block;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.3;
      color: #1b2c5a;
    }

    .feature-card__text {
      margin: 4px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: #66718c;
    }

    .scope-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .scope-card {
      padding: 16px 16px 14px;
      border: 1px solid #e3e8f1;
      background: #fff;
      min-height: 100%;
    }

    .scope-card__head {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .scope-card__badge {
      width: 40px;
      height: 40px;
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
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #16285c;
    }

    .scope-card__summary {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: #59637e;
    }

    .scope-card__stat-label,
    .scope-card__services-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #7d89a1;
    }

    .scope-card__stat-value {
      margin-top: 8px;
      font-size: 42px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.05em;
      color: var(--brand);
    }

    .scope-card__stat-sub {
      margin-top: 2px;
      font-size: 13px;
      color: #68748f;
    }

    .scope-card__divider {
      height: 1px;
      margin: 16px 0 12px;
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
      padding: 4px 8px;
      border-radius: 4px;
      background: #eef2f8;
      font-size: 11px;
      font-weight: 700;
      color: #40506d;
    }

    .tag--muted {
      background: #f4f6fa;
      color: #76829d;
    }

    .investment-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 0.95fr);
      gap: 24px;
      align-items: start;
    }

    .investment-card {
      border: 1px solid #e2e8f2;
      background: #fff;
    }

    .investment-card__body {
      padding: 10px 16px 0;
    }

    .investment-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 16px;
      align-items: center;
      padding: 13px 0;
      border-bottom: 1px solid var(--line);
      font-size: 14px;
      color: #59657f;
    }

    .investment-row strong {
      color: #1d2d58;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    .investment-total {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 16px;
      align-items: center;
      margin-top: 0;
      padding: 18px 16px;
      background: #f3f7ff;
      color: var(--brand);
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .investment-total strong {
      font-size: 22px;
      letter-spacing: -0.04em;
      font-variant-numeric: tabular-nums;
    }

    .why-choose {
      background: #fff;
    }

    .why-choose__title {
      margin: 0 0 14px;
      text-align: center;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.045em;
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
      gap: 28px;
      padding: 24px 32px 26px;
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
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      color: #21d3f6;
    }

    .footer-panel__text {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
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
      font-size: 13px;
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
    <header class="proposal-topbar">
      <div class="proposal-brand" aria-label="CService">
        <span class="proposal-brand__mark" aria-hidden="true"></span>
        <span class="proposal-brand__word">CService</span>
      </div>
    </header>

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
        <div class="feature-grid">
          ${serviceHighlights.map((item) => renderFeatureCard(item, 'soft')).join('')}
        </div>
      </section>

      <section class="content-section">
        <div class="investment-layout">
          <div>
            <h2 class="section-heading section-heading--inline">Distribuição e entrega</h2>
            <div class="feature-grid feature-grid--two">
              ${deliveryItems.map((item) => renderFeatureCard(item)).join('')}
            </div>
          </div>

          <div>
            <h2 class="section-heading section-heading--inline">Composição do investimento</h2>
            <div class="investment-card">
              <div class="investment-card__body">
                ${investmentRows
        .map((row) => `
                      <div class="investment-row">
                        <span>${escapeHtml(row.label)}</span>
                        <strong>${escapeHtml(row.value)}</strong>
                      </div>
                    `)
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
</html>`;
}
