import type { MonitoringServiceKey, SectionKey } from './types'

export interface Prices {
  volumePrice: number
  destinatarioPrice: number
  servicePrices: Record<MonitoringServiceKey, number>
  broadcast: {
    tv: { sp_rj: number; nacional: number }
    radio: { sp_rj: number; nacional: number }
    relatorio: { mensal: number; semanal: number }
  }
  additionals: {
    midiasSociaisIncludedPosts: number
    midiasSociaisExcessPostsStep: number
    midiasSociaisExcessPricePerStep: number
    alertasWebPricePerExtraEnvio: number
    api: number
    stories: number
    destaques: number
  }
}

export const DEFAULT_PRICES: Prices = {
  volumePrice: 2.15,
  destinatarioPrice: 0.35,
  servicePrices: {
    texto: 1.2,
    centimetragem: 0.85,
    grifo: 0.45,
    score: 0.65,
    avaliacao: 1.5,
    ia: 2.1,
    screenshot: 0.95,
  },
  broadcast: {
    tv: { sp_rj: 500, nacional: 1800 },
    radio: { sp_rj: 320, nacional: 950 },
    relatorio: { mensal: 1000, semanal: 1850 },
  },
  additionals: {
    midiasSociaisIncludedPosts: 300,
    midiasSociaisExcessPostsStep: 100,
    midiasSociaisExcessPricePerStep: 50,
    alertasWebPricePerExtraEnvio: 50,
    api: 400,
    stories: 280,
    destaques: 220,
  },
}

/** Preço base mensal inicial da configuração (espelha o seed do estado da proposta). */
export const DEFAULT_PRECO_BASE_MENSAL = 250

export const MONITORING_LABELS: Record<MonitoringServiceKey, string> = {
  texto: 'Texto',
  centimetragem: 'Centimetragem',
  grifo: 'Grifo',
  score: 'Score',
  avaliacao: 'Avaliação',
  ia: 'IA',
  screenshot: 'Screenshot',
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  marcas: 'Marcas',
  concorrentes: 'Concorrentes',
  setor: 'Setor',
}
