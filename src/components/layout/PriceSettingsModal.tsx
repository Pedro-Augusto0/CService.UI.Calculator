import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import {
  DEFAULT_PRICES,
  MONITORING_LABELS,
  type Prices,
} from '../../domain/prices'
import { MONITORING_SERVICE_KEYS } from '../../domain/types'
import './PriceSettingsModal.css'

interface PriceSettingsModalProps {
  open: boolean
  prices: Prices
  onClose: () => void
  onSave: (p: Prices) => void
}

function num(v: string): number {
  const n = Number.parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function PriceSettingsModal({
  open,
  prices,
  onClose,
  onSave,
}: PriceSettingsModalProps) {
  const [draft, setDraft] = useState<Prices>(() => structuredClone(prices))

  useEffect(() => {
    if (open) setDraft(structuredClone(prices))
  }, [open, prices])

  if (!open) return null

  function patch<K extends keyof Prices>(key: K, value: Prices[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  return (
    <div className="price-modal-overlay" role="dialog" aria-modal="true">
      <div className="price-modal">
        <div className="price-modal__header">
          <h2 className="price-modal__title">Configurações de preços</h2>
          <button
            type="button"
            className="price-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="price-modal__body">
          <section className="price-modal__section">
            <h3>Núcleo</h3>
            <div className="price-modal__stack">
              <TextField
                dense
                id="vp"
                label="Preço por volume (R$ × notícias/mês agregadas)"
                value={draft.volumePrice}
                onChange={(e) => patch('volumePrice', num(e.target.value))}
              />
              <TextField
                dense
                id="dp"
                label="Preço destinatário-envio-dia (newsletter)"
                value={draft.destinatarioPrice}
                onChange={(e) =>
                  patch('destinatarioPrice', num(e.target.value))
                }
              />
            </div>
          </section>

          <section className="price-modal__section">
            <h3>Serviços por tipo (unitário × volume)</h3>
            <div className="price-modal__grid">
              {MONITORING_SERVICE_KEYS.map((k) => (
                <TextField
                  key={k}
                  dense
                  label={MONITORING_LABELS[k]}
                  value={draft.servicePrices[k]}
                  onChange={(e) =>
                    patch('servicePrices', {
                      ...draft.servicePrices,
                      [k]: num(e.target.value),
                    })
                  }
                />
              ))}
            </div>
          </section>

          <section className="price-modal__section">
            <h3>Broadcast fixo</h3>
            <div className="price-modal__grid2">
              <TextField
                dense
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
              <TextField
                dense
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

          <section className="price-modal__section">
            <h3>Adicionais e regras</h3>
            <div className="price-modal__grid2">
              <TextField
                dense
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
        </div>

        <div className="price-modal__footer">
          <Button
            variant="ghost"
            onClick={() => {
              setDraft(structuredClone(DEFAULT_PRICES))
            }}
          >
            Restaurar padrão
          </Button>
          <div className="price-modal__footer-right">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onSave(structuredClone(draft))
                onClose()
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
