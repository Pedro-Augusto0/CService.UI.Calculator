import { describe, expect, it } from 'vitest'
import { defaultSections, effectiveMode, updateCalculations } from './calculations'
import type { Prices } from './prices'
import type { CalculationInput } from './types'

function basePrices(): Prices {
  return {
    matterServices: {
      centimetragem: { mode: 'both', fixedPrice: 200, variablePrice: 1 },
      grifo: { mode: 'fixed', fixedPrice: 150, variablePrice: 99 },
      score: { mode: 'variable', fixedPrice: 99, variablePrice: 0.5 },
      ia: { mode: 'both', fixedPrice: 400, variablePrice: 2 },
      screenshot: { mode: 'variable', fixedPrice: 99, variablePrice: 1 },
      avaliacao: {
        mode: 'both',
        tiers: [
          { id: 't2', label: 'Até 2', fixedPrice: 100, variablePrice: 1 },
          { id: 't5', label: 'Até 5', fixedPrice: 250, variablePrice: 2 },
          { id: 't7', label: 'Até 7', fixedPrice: 400, variablePrice: 3 },
        ],
      },
    },
    reports: {
      executivo: {
        byFrequency: {
          semanal: 1000,
          quinzenal: 800,
          mensal: 600,
          trimestral: 500,
          semestral: 400,
          anual: 300,
        },
      },
      estrategico: {
        byFrequency: {
          semanal: 900,
          quinzenal: 700,
          mensal: 500,
          trimestral: 450,
          semestral: 350,
          anual: 250,
        },
      },
      bi: { setupPrice: 2000, monthlyMaintenance: 500 },
    },
    additionals: {
      impresso: 120,
      web: { nacional: 180, internacional: 400 },
      radio: { spRj: 100, nacional: 300 },
      tv: { spRj: 200, nacional: 600 },
      midiasSociais: {
        tiers: [
          { id: 'ms-100', label: 'Até 100', upTo: 100, price: 100 },
          { id: 'ms-250', label: 'Até 250', upTo: 250, price: 220 },
        ],
      },
      storiesInstagram: {
        tiers: [
          { id: 'sg-100', label: 'Até 100', upTo: 100, price: 80 },
          { id: 'sg-250', label: 'Até 250', upTo: 250, price: 180 },
        ],
      },
      alertasWebRealtime: 150,
      apiCService: 250,
      newsletterWhatsApp: 90,
      newsletterExtraEnvio: 20,
      destinatariosExtras: {
        tiers: [
          { id: 'de-10', label: '+10', upTo: 10, price: 40 },
          { id: 'de-25', label: '+25', upTo: 25, price: 90 },
        ],
      },
      plantaoPercent: 25,
      curadoriaAprovacaoManual: 120,
      aprovacaoAutomaticaPercent: 10,
    },
    validadeOptions: [15, 30, 60],
  }
}

function baseInput(): CalculationInput {
  return {
    sections: defaultSections(),
    globalBillingMode: 'variable',
    avaliacaoTierId: null,
    reports: {
      executivoEnabled: false,
      executivoFreq: null,
      estrategicoEnabled: false,
      estrategicoFreq: null,
      biEnabled: false,
    },
    additionals: {
      impressoEnabled: false,
      webNacionalEnabled: false,
      webInternacionalEnabled: false,
      radioEnabled: false,
      radioRegion: null,
      tvEnabled: false,
      tvRegion: null,
      midiasSociaisEnabled: false,
      midiasSociaisTierId: null,
      storiesInstagramEnabled: false,
      storiesInstagramTierId: null,
      alertasWebRealtime: false,
      apiCService: false,
      newsletterWhatsApp: false,
      newsletterExtraEnvios: 0,
      destinatariosExtrasEnabled: false,
      destinatariosExtrasTierId: null,
      plantaoFimSemana: false,
      curadoriaAprovacaoManual: false,
      aprovacaoAutomatica: false,
    },
    precoBaseMensal: 0,
    validadeDias: 30,
    descontoTotalPercent: 0,
  }
}

describe('effectiveMode', () => {
  it('preserves fixed mode regardless of toggle', () => {
    expect(effectiveMode('fixed', 'variable')).toBe('fixed')
    expect(effectiveMode('fixed', 'fixed')).toBe('fixed')
  })

  it('preserves variable mode regardless of toggle', () => {
    expect(effectiveMode('variable', 'variable')).toBe('variable')
    expect(effectiveMode('variable', 'fixed')).toBe('variable')
  })

  it('follows toggle when mode is both', () => {
    expect(effectiveMode('both', 'variable')).toBe('variable')
    expect(effectiveMode('both', 'fixed')).toBe('fixed')
  })
})

describe('updateCalculations', () => {
  it('retorna apenas precoBaseMensal quando nada está selecionado', () => {
    const input = baseInput()
    input.precoBaseMensal = 1500
    const r = updateCalculations(input, basePrices())
    expect(r.finalPrice).toBe(1500)
    expect(r.matterServicesTotal).toBe(0)
    expect(r.reportsTotal).toBe(0)
    expect(r.additionalsTotal).toBe(0)
    expect(r.hasActiveServices).toBe(false)
  })

  it('serviço com modo "variable" usa preço por volume', () => {
    const input = baseInput()
    input.sections.marcas.volume = 100
    input.sections.marcas.services.score = true
    const r = updateCalculations(input, basePrices())
    expect(r.matterServiceValues.score).toBe(100 * 0.5)
  })

  it('serviço com modo "fixed" sempre usa preço fixo, ignorando toggle', () => {
    const input = baseInput()
    input.sections.marcas.volume = 999
    input.sections.marcas.services.grifo = true
    input.globalBillingMode = 'variable'
    const r1 = updateCalculations(input, basePrices())
    expect(r1.matterServiceValues.grifo).toBe(150)

    input.globalBillingMode = 'fixed'
    const r2 = updateCalculations(input, basePrices())
    expect(r2.matterServiceValues.grifo).toBe(150)
  })

  it('serviço com modo "both" responde ao toggle global', () => {
    const input = baseInput()
    input.sections.marcas.volume = 100
    input.sections.marcas.services.ia = true

    input.globalBillingMode = 'fixed'
    expect(updateCalculations(input, basePrices()).matterServiceValues.ia).toBe(400)

    input.globalBillingMode = 'variable'
    expect(updateCalculations(input, basePrices()).matterServiceValues.ia).toBe(100 * 2)
  })

  it('Avaliação requer tier selecionada e aplica modo correto', () => {
    const input = baseInput()
    input.sections.marcas.volume = 50
    input.sections.marcas.services.avaliacao = true

    input.avaliacaoTierId = null
    expect(updateCalculations(input, basePrices()).matterServiceValues.avaliacao).toBe(0)

    input.avaliacaoTierId = 't5'
    input.globalBillingMode = 'fixed'
    expect(updateCalculations(input, basePrices()).matterServiceValues.avaliacao).toBe(250)

    input.globalBillingMode = 'variable'
    expect(updateCalculations(input, basePrices()).matterServiceValues.avaliacao).toBe(50 * 2)
  })

  it('Avaliação variável usa só volume das seções em que está ligada', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.concorrentes.volume = 20
    input.sections.setor.volume = 30
    input.sections.marcas.services.avaliacao = true
    input.avaliacaoTierId = 't5'
    input.globalBillingMode = 'variable'
    expect(updateCalculations(input, basePrices()).matterServiceValues.avaliacao).toBe(
      10 * 2,
    )

    input.sections.concorrentes.services.avaliacao = true
    expect(updateCalculations(input, basePrices()).matterServiceValues.avaliacao).toBe(
      30 * 2,
    )
  })

  it('volume é soma de todas as seções', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.concorrentes.volume = 20
    input.sections.setor.volume = 30
    input.sections.marcas.services.score = true
    const r = updateCalculations(input, basePrices())
    expect(r.totalVolume).toBe(60)
    expect(r.matterServiceValues.score).toBe(60 * 0.5)
  })

  it('relatórios e BI cobrados conforme frequência e flags', () => {
    const input = baseInput()
    input.reports.executivoEnabled = true
    input.reports.executivoFreq = 'mensal'
    input.reports.estrategicoEnabled = true
    input.reports.estrategicoFreq = 'semanal'
    input.reports.biEnabled = true
    const r = updateCalculations(input, basePrices())
    expect(r.reportsTotal).toBe(600 + 900 + 2000 + 500)
  })

  it('impresso e web nacional/internacional somam independentemente', () => {
    const input = baseInput()
    input.additionals.impressoEnabled = true
    input.additionals.webNacionalEnabled = true
    input.additionals.webInternacionalEnabled = true
    expect(updateCalculations(input, basePrices()).additionalsTotal).toBe(120 + 180 + 400)
  })

  it('rádio cobrado apenas se enabled e com região', () => {
    const input = baseInput()
    input.additionals.radioEnabled = true
    input.additionals.radioRegion = null
    expect(updateCalculations(input, basePrices()).additionalsTotal).toBe(0)

    input.additionals.radioRegion = 'spRj'
    expect(updateCalculations(input, basePrices()).additionalsTotal).toBe(100)

    input.additionals.radioRegion = 'nacional'
    expect(updateCalculations(input, basePrices()).additionalsTotal).toBe(300)
  })

  it('mídias sociais cobra preço da faixa selecionada', () => {
    const input = baseInput()
    input.additionals.midiasSociaisEnabled = true
    input.additionals.midiasSociaisTierId = 'ms-250'
    expect(updateCalculations(input, basePrices()).additionalsTotal).toBe(220)
  })

  it('newsletter adicional cobra fixo por envio extra', () => {
    const input = baseInput()
    input.additionals.newsletterExtraEnvios = 3
    expect(updateCalculations(input, basePrices()).additionalsTotal).toBe(3 * 20)
  })

  it('plantão aplica + plantaoPercent% sobre subtotal', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.marcas.services.score = true
    input.additionals.plantaoFimSemana = true

    const prices = basePrices()
    const r = updateCalculations(input, prices)
    expect(r.factorPlantao).toBe(1.25)
    expect(r.valorAcrescimoPlantao).toBeCloseTo(10 * 0.5 * 0.25)
  })

  it('aprovação automática aplica desconto sobre total já com plantão', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.marcas.services.score = true
    input.additionals.plantaoFimSemana = true
    input.additionals.aprovacaoAutomatica = true
    input.precoBaseMensal = 1000

    const prices = basePrices()
    const r = updateCalculations(input, prices)
    const subtotal = 10 * 0.5 // 5
    const expected = subtotal * 1.25 * 0.9 + 1000
    expect(r.finalPrice).toBeCloseTo(expected)
  })

  it('preço base mensal não é afetado pelos modificadores percentuais', () => {
    const input = baseInput()
    input.precoBaseMensal = 1000
    input.additionals.plantaoFimSemana = true
    const r = updateCalculations(input, basePrices())
    expect(r.finalPrice).toBe(1000)
  })

  it('desconto total comercial aplica sobre investimento após ajustes catalogados e preço base', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.marcas.services.score = true
    input.precoBaseMensal = 1000
    input.descontoTotalPercent = 20

    const r = updateCalculations(input, basePrices())
    const variavel = 10 * 0.5
    expect(r.valorAntesDescontoComercial).toBeCloseTo(variavel + 1000)
    expect(r.finalPrice).toBeCloseTo((variavel + 1000) * 0.8)
    expect(r.valorDescontoTotal).toBeLessThan(0)
  })

  it('selectedMatterLabels lista apenas serviços com valor > 0', () => {
    const input = baseInput()
    input.sections.marcas.volume = 10
    input.sections.marcas.services.score = true
    input.sections.marcas.services.grifo = true
    const r = updateCalculations(input, basePrices())
    expect(r.selectedMatterLabels.length).toBe(2)
  })
})
