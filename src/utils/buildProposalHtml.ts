import type { CalculationInput, CalculationResult } from '../domain/types'
import { SECTION_LABELS, MONITORING_LABELS } from '../domain/prices'
import { SECTION_KEYS, MONITORING_SERVICE_KEYS } from '../domain/types'
import { formatCurrency } from './currency'

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function buildProposalHtml(
  input: CalculationInput,
  calc: CalculationResult,
): string {
  const rows: { label: string; value: string }[] = []

  if (calc.breakdownGroups.precoBaseMensal > 0) {
    rows.push({
      label: 'Preço base mensal',
      value: formatCurrency(calc.breakdownGroups.precoBaseMensal),
    })
  }
  rows.push({
    label: 'Serviços de monitoramento',
    value: formatCurrency(calc.breakdownGroups.servicosMonitoramento),
  })
  rows.push({
    label: 'Serviços adicionais',
    value: formatCurrency(calc.breakdownGroups.servicosAdicionais),
  })
  rows.push({
    label: 'Relatório analítico',
    value: formatCurrency(calc.breakdownGroups.relatorioAnalitico),
  })

  const scopeBlocks = SECTION_KEYS.map((key) => {
    const sec = input.sections[key]
    const svcs = MONITORING_SERVICE_KEYS.filter((s) => sec.services[s]).map(
      (s) => MONITORING_LABELS[s],
    )
    return `
      <section class="block">
        <h3>${escapeHtml(SECTION_LABELS[key])}</h3>
        <p><strong>Palavras-chave:</strong> ${sec.keywords.length ? escapeHtml(sec.keywords.join(', ')) : '—'}</p>
        <p><strong>Volume estimado:</strong> ${sec.volume} notícias/mês</p>
        <p><strong>Serviços:</strong> ${svcs.length ? escapeHtml(svcs.join(', ')) : '—'}</p>
      </section>`
  }).join('\n')

  const broadcastList: string[] = []
  if (input.broadcast.tvEnabled && input.broadcast.tvRegion) {
    broadcastList.push(
      `TV (${input.broadcast.tvRegion === 'sp_rj' ? 'SP + RJ' : 'Nacional'})`,
    )
  }
  if (input.broadcast.radioEnabled && input.broadcast.radioRegion) {
    broadcastList.push(
      `Rádio (${input.broadcast.radioRegion === 'sp_rj' ? 'SP + RJ' : 'Nacional'})`,
    )
  }
  if (input.broadcast.relatorioEnabled && input.broadcast.relatorioFreq) {
    broadcastList.push(
      `Relatório (${input.broadcast.relatorioFreq === 'mensal' ? 'Mensal' : 'Semanal'})`,
    )
  }

  const adds: string[] = []
  if (input.additionals.midiasSociais) adds.push('Mídias Sociais')
  if (input.additionals.alertasWeb) adds.push('Alertas de WebSites')
  if (input.additionals.api) adds.push('Acesso API')
  if (input.additionals.stories) adds.push('Stories')
  if (input.additionals.destaques) adds.push('Destaques da Semana')

  const modParts: string[] = []
  if (calc.factorWeekend > 1)
    modParts.push('Envio em fins de semana / feriados (+25%)')
  if (calc.factorAutoApproval < 1)
    modParts.push('Aprovação automática (−40%)')

  const tableRows = rows
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.label)}</td><td class="num">${escapeHtml(r.value)}</td></tr>`,
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Proposta · Monitoramento de mídia</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; }
    .wrap { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; }
    h1 { font-size: 1.5rem; margin-top: 0; color: #0052ff; }
    h2 { font-size: 1.1rem; margin-top: 28px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    h3 { font-size: 1rem; margin-bottom: 8px; }
    .block { margin-bottom: 16px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    .final { margin-top: 24px; padding: 20px; background: #e8f0ff; border-radius: 12px; border: 1px solid #bfdbfe; text-align: center; }
    .final strong { display: block; font-size: 1.75rem; color: #0052ff; margin-top: 8px; }
    ul { margin: 8px 0 0 20px; }
    .muted { color: #64748b; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Proposta comercial · Monitoramento de mídia</h1>
    <p class="muted">Documento gerado pela Calculadora de Proposta.</p>

    <h2>Escopo do monitoramento</h2>
    ${scopeBlocks}

    <h2>Broadcast e relatório</h2>
    <div class="block">
      ${broadcastList.length ? `<ul>${broadcastList.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : '<p>—</p>'}
    </div>

    <h2>Serviços adicionais</h2>
    <div class="block">
      ${adds.length ? `<ul>${adds.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : '<p>—</p>'}
    </div>

    <h2>Parâmetros operacionais</h2>
    <div class="block">
      <p><strong>Envios diários:</strong> ${input.operational.enviosDiarios}</p>
      <p><strong>Destinatários:</strong> ${input.operational.numDestinatarios}</p>
      <p><strong>Modificadores:</strong> ${modParts.length ? escapeHtml(modParts.join(' · ')) : '—'}</p>
    </div>

    <h2>Resumo de valores</h2>
    <table>
      ${tableRows}
    </table>
    <div class="final">
      Preço final recorrente
      <strong>${escapeHtml(formatCurrency(calc.finalPrice))}</strong>
      <span class="muted">por mês</span>
    </div>
  </div>
</body>
</html>`
}
