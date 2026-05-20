import type { ReactNode } from 'react'
import { Radar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { Toggle } from '@/components/ui/Toggle'
import { type RegionKey } from '@/domain/types'
import { REGION_LABELS } from '@/domain/prices'
import { useProposal } from '@/features/proposal/hooks/useProposal'
import '../servicos-adicionais/ServicosAdicionais.css'
import '../escopo/Escopo.css'
import './TiposMidia.css'

function RegionButtons({
  region,
  disabled,
  onChange,
}: {
  region: RegionKey | null
  disabled: boolean
  onChange: (region: RegionKey | null) => void
}) {
  function pick(next: RegionKey) {
    onChange(region === next ? null : next)
  }
  return (
    <div className="add-page__region-buttons" role="group" aria-label="Região">
      <button
        type="button"
        className={`add-page__region ${region === 'spRj' ? 'add-page__region--on' : ''}`}
        disabled={disabled}
        onClick={() => pick('spRj')}
      >
        {REGION_LABELS.spRj}
      </button>
      <button
        type="button"
        className={`add-page__region ${region === 'nacional' ? 'add-page__region--on' : ''}`}
        disabled={disabled}
        onClick={() => pick('nacional')}
      >
        {REGION_LABELS.nacional}
      </button>
    </div>
  )
}

function Lead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="escopo-page__meta-card tipos-midia-page__lead">
      <div className="escopo-page__meta-head">
        <span className="escopo-page__meta-icon" aria-hidden>
          <Radar size={18} strokeWidth={2} />
        </span>
        <div>
          <h2 className="escopo-page__meta-title">{title}</h2>
          <p className="escopo-page__meta-text">{children}</p>
        </div>
      </div>
    </Card>
  )
}

export function TiposMidia() {
  const { state, dispatch } = useProposal()
  const a = state.additionals
  const prices = state.prices

  return (
    <div className="page-etapa add-page tipos-midia-page">
      <Lead title="Monitoramento — tipos de mídia">
        Selecione monitoramentos para esta proposta.
      </Lead>

      <div className="add-page__grid">
        <Card className="add-page__bc tipos-midia-card">
          <div className="tipos-midia-card__primary">
            <Toggle
              checked={a.impressoEnabled}
              onChange={(v) => dispatch({ type: 'TOGGLE_IMPRESSO', enabled: v })}
              label="Impresso"
              description="Valor mensal único (tabela de preços)."
            />
          </div>
        </Card>

        <Card className="add-page__bc tipos-midia-card">
          <div className="tipos-midia-card__web-head">
            <div className="tipos-midia-card__web-titles">
              <span className="tipos-midia-card__web-title">Monitoramento Web</span>
              <span className="tipos-midia-card__web-sub">
                Nacional e Internacional são independentes — ambos podem ficar ativos.
              </span>
            </div>
          </div>
          <div className="tipos-midia-card__footer">
            <div className="tipos-midia-card__web-panel">
              <Toggle
                checked={a.webNacionalEnabled}
                onChange={(v) => dispatch({ type: 'TOGGLE_WEB_NACIONAL', enabled: v })}
                label="Nacional"
                description="Cobertura web nacional."
              />
              <Toggle
                checked={a.webInternacionalEnabled}
                onChange={(v) =>
                  dispatch({ type: 'TOGGLE_WEB_INTERNACIONAL', enabled: v })
                }
                label="Internacional"
                description="Cobertura web internacional."
              />
            </div>
          </div>
        </Card>

        <Card className="add-page__bc tipos-midia-card">
          <div className="tipos-midia-card__primary">
            <Toggle
              checked={a.radioEnabled}
              onChange={(v) => dispatch({ type: 'TOGGLE_RADIO', enabled: v })}
              label="Rádio"
              description="Cobrança fixa regional (mutuamente exclusiva)."
            />
          </div>
          <div className="tipos-midia-card__footer">
            <RegionButtons
              region={a.radioRegion}
              disabled={!a.radioEnabled}
              onChange={(region) => dispatch({ type: 'SET_RADIO_REGION', region })}
            />
          </div>
        </Card>

        <Card className="add-page__bc tipos-midia-card">
          <div className="tipos-midia-card__primary">
            <Toggle
              checked={a.tvEnabled}
              onChange={(v) => dispatch({ type: 'TOGGLE_TV', enabled: v })}
              label="TV"
              description="Cobrança fixa regional (mutuamente exclusiva)."
            />
          </div>
          <div className="tipos-midia-card__footer">
            <RegionButtons
              region={a.tvRegion}
              disabled={!a.tvEnabled}
              onChange={(region) => dispatch({ type: 'SET_TV_REGION', region })}
            />
          </div>
        </Card>

        <Card className="add-page__bc tipos-midia-card">
          <div className="tipos-midia-card__primary">
            <Toggle
              checked={a.midiasSociaisEnabled}
              onChange={(v) =>
                dispatch({ type: 'TOGGLE_MIDIAS_SOCIAIS', enabled: v })
              }
              label="Mídias sociais"
              description="Selecione a faixa por quantidade de posts."
            />
          </div>
          <div className="tipos-midia-card__footer">
            <SelectField
              dense
              id="midia-ms-tier"
              label="Faixa (posts)"
              disabled={!a.midiasSociaisEnabled}
              value={a.midiasSociaisTierId ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_MIDIAS_SOCIAIS_TIER',
                  tierId: e.target.value || null,
                })
              }
            >
              <option value="">Selecione…</option>
              {prices.additionals.midiasSociais.tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </SelectField>
          </div>
        </Card>

        <Card className="add-page__bc tipos-midia-card">
          <div className="tipos-midia-card__primary">
            <Toggle
              checked={a.storiesInstagramEnabled}
              onChange={(v) =>
                dispatch({ type: 'TOGGLE_STORIES_INSTAGRAM', enabled: v })
              }
              label="Instagram Stories"
              description="Selecione a faixa por quantidade de perfis."
            />
          </div>
          <div className="tipos-midia-card__footer">
            <SelectField
              dense
              id="midia-sg-tier"
              label="Faixa (perfis)"
              disabled={!a.storiesInstagramEnabled}
              value={a.storiesInstagramTierId ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'SET_STORIES_INSTAGRAM_TIER',
                  tierId: e.target.value || null,
                })
              }
            >
              <option value="">Selecione…</option>
              {prices.additionals.storiesInstagram.tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </SelectField>
          </div>
        </Card>
      </div>
    </div>
  )
}
