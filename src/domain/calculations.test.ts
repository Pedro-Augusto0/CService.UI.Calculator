import { describe, expect, it } from 'vitest'
import {
  defaultSections,
  emptyServiceValues,
  updateCalculations,
} from './calculations'
import type { Prices } from './prices'
import type { CalculationInput } from './types'
import { MONITORING_SERVICE_KEYS } from './types'

const simplePrices: Prices = {
  volumePrice: 10,
  destinatarioPrice: 1,
  servicePrices: {
    texto: 5,
    centimetragem: 0,
    grifo: 0,
    score: 0,
    avaliacao: 0,
    ia: 0,
    screenshot: 0,
  },
  broadcast: {
    tv: { sp_rj: 100, nacional: 200 },
    radio: { sp_rj: 50, nacional: 99 },
    relatorio: { mensal: 300, semanal: 500 },
  },
  additionals: {
    midiasSociaisIncludedPosts: 300,
    midiasSociaisExcessPostsStep: 100,
    midiasSociaisExcessPricePerStep: 50,
    alertasWebPricePerExtraEnvio: 50,
    api: 400,
    stories: 10,
    destaques: 10,
  },
}

function baseInput(): CalculationInput {
  return {
    sections: defaultSections(),
    broadcast: {
      tvEnabled: false,
      tvRegion: '',
      radioEnabled: false,
      radioRegion: '',
      relatorioEnabled: false,
      relatorioFreq: '',
    },
    additionals: {
      midiasSociais: false,
      alertasWeb: false,
      api: false,
      stories: false,
      destaques: false,
    },
    operational: {
      enviosDiarios: 0,
      numDestinatarios: 0,
      envioFeriadosFds: false,
      aprovacaoAutomatica: false,
    },
    precoBaseMensal: 0,
  }
}

describe('updateCalculations', () => {
  it('não cobra serviço por volume quando volume é 0', () => {
    const input = baseInput()
    input.sections.marcas.volume = 0
    input.sections.marcas.services.texto = true
    const r = updateCalculations(input, simplePrices)
    expect(r.serviceValues.texto).toBe(0)
  })

  it('cobra serviço por volume quando volume > 0', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.marcas.services.texto = true
    const r = updateCalculations(input, simplePrices)
    expect(r.serviceValues.texto).toBe(50)
    expect(r.volumeMonetaryBase).toBe(100)
    expect(r.subtotalBeforeModifiers).toBe(150)
  })

  it('só cobra broadcast quando habilitado e opção válida', () => {
    const input = baseInput()
    input.broadcast.tvEnabled = false
    input.broadcast.tvRegion = 'sp_rj'
    expect(updateCalculations(input, simplePrices).serviceValues.tv).toBe(0)

    input.broadcast.tvEnabled = true
    input.broadcast.tvRegion = ''
    expect(updateCalculations(input, simplePrices).serviceValues.tv).toBe(0)

    input.broadcast.tvRegion = 'sp_rj'
    expect(updateCalculations(input, simplePrices).serviceValues.tv).toBe(100)
  })

  it('envios usa 22 ou 30 dias conforme flag', () => {
    const input = baseInput()
    input.operational.enviosDiarios = 2
    input.operational.numDestinatarios = 3

    input.operational.envioFeriadosFds = false
    const r22 = updateCalculations(input, simplePrices)
    expect(r22.serviceValues.envios).toBe(2 * 3 * 22 * 1)

    input.operational.envioFeriadosFds = true
    const r30 = updateCalculations(input, simplePrices)
    expect(r30.serviceValues.envios).toBe(2 * 3 * 30 * 1)
  })

  it('aplica modificadores em sequência 1.25 depois 0.60', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.marcas.services.texto = true
    input.operational.envioFeriadosFds = true
    input.operational.aprovacaoAutomatica = true
    input.precoBaseMensal = 100

    const base = 10 * 10 + 10 * 5 // PB + S = 150
    const expected = base * 1.25 * 0.6 + 100

    const r = updateCalculations(input, simplePrices)
    expect(r.factorWeekend).toBe(1.25)
    expect(r.factorAutoApproval).toBe(0.6)
    expect(r.finalPrice).toBeCloseTo(expected)
    expect(r.priceAfterModifiersBeforeMonthlyBase).toBeCloseTo(base * 1.25 * 0.6)
  })

  it('mídias sociais: excedente por blocos de 100 posts', () => {
    const input = baseInput()
    input.additionals.midiasSociais = true
    input.operational.enviosDiarios = 20 // 600 posts/mês → 300 extra → ceil(3)*50 = 150
    const r = updateCalculations(input, simplePrices)
    expect(r.serviceValues.midias_sociais).toBe(150)
  })

  it('alertas websites: (envios-1)*50 quando envios > 1', () => {
    const input = baseInput()
    input.additionals.alertasWeb = true
    input.operational.enviosDiarios = 4
    const r = updateCalculations(input, simplePrices)
    expect(r.serviceValues.alertas_web).toBe(150)
  })

  it('emptyServiceValues zera todas as chaves', () => {
    const z = emptyServiceValues()
    for (const k of Object.keys(z)) {
      expect(z[k as keyof typeof z]).toBe(0)
    }
    expect(MONITORING_SERVICE_KEYS.length).toBe(7)
  })
})
