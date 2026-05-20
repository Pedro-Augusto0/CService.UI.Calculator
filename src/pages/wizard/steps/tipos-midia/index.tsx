import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Globe,
  Info,
  Newspaper,
  Radar,
  Radio,
  Sparkles,
  ThumbsUp,
  Tv,
} from 'lucide-react'
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

function MidiaCard({
  icon: Icon,
  title,
  description,
  enabled,
  onEnabledChange,
  toggleId,
  children,
  hideFooterWhenOff = false,
}: {
  icon: LucideIcon
  title: string
  description: string
  enabled: boolean
  onEnabledChange: (v: boolean) => void
  toggleId: string
  children: ReactNode
  /** Só Impresso: sem área de config quando desligado */
  hideFooterWhenOff?: boolean
}) {
  const showFooter = hideFooterWhenOff ? enabled : true
  return (
    <Card className="add-page__bc tipos-midia-card">
      <span className="tipos-midia-card__accent" aria-hidden />
      <div className="tipos-midia-card__header">
        <div className="tipos-midia-card__header-main">
          <span className="tipos-midia-card__type-icon" aria-hidden>
            <Icon size={20} strokeWidth={2} />
          </span>
          <div className="tipos-midia-card__heading-wrap">
            <span className="tipos-midia-card__heading">{title}</span>
            <p className="tipos-midia-card__tagline">{description}</p>
          </div>
        </div>
        <Toggle
          id={toggleId}
          label={title}
          checked={enabled}
          onChange={onEnabledChange}
        />
      </div>
      {showFooter ? (
        <div
          className={`tipos-midia-card__footer tipos-midia-card__config-wrap ${!enabled ? 'tipos-midia-card__config-wrap--disabled' : ''}`}
        >
          {children}
        </div>
      ) : null}
    </Card>
  )
}

export function TiposMidia() {
  const { state, dispatch } = useProposal()
  const a = state.additionals
  const prices = state.prices

  const webAny = a.webNacionalEnabled || a.webInternacionalEnabled

  function setWebMaster(on: boolean) {
    if (!on) {
      dispatch({
        type: 'SET_ADDITIONALS',
        patch: {
          webNacionalEnabled: false,
          webInternacionalEnabled: false,
        },
      })
      return
    }
    if (!a.webNacionalEnabled && !a.webInternacionalEnabled) {
      dispatch({ type: 'TOGGLE_WEB_NACIONAL', enabled: true })
    }
  }

  return (
    <div className="page-etapa add-page tipos-midia-page">
      <Lead title="Monitoramento — tipos de mídia">
        Selecione os monitoramentos que deseja incluir nesta proposta.
      </Lead>

      <div className="add-page__grid tipos-midia-page__grid">
        <MidiaCard
          icon={Newspaper}
          title="Impresso"
          description="Valor mensal único (tabela de preços)."
          enabled={a.impressoEnabled}
          onEnabledChange={(v) => dispatch({ type: 'TOGGLE_IMPRESSO', enabled: v })}
          toggleId="midia-impresso"
          hideFooterWhenOff
        >
          <div className="tipos-midia-card__config tipos-midia-card__config--split">
            <div className="tipos-midia-card__config-cell">
              <span className="tipos-midia-card__config-label">Entrega</span>
              <span className="tipos-midia-card__config-value">Diária</span>
            </div>
            <div className="tipos-midia-card__config-cell">
              <span className="tipos-midia-card__config-label">Cobertura</span>
              <span className="tipos-midia-card__config-value">
                Regional / Nacional
              </span>
            </div>
          </div>
        </MidiaCard>

        <Card className="add-page__bc tipos-midia-card">
          <span className="tipos-midia-card__accent" aria-hidden />
          <div className="tipos-midia-card__header">
            <div className="tipos-midia-card__header-main">
              <span className="tipos-midia-card__type-icon" aria-hidden>
                <Globe size={20} strokeWidth={2} />
              </span>
              <div className="tipos-midia-card__heading-wrap">
                <span className="tipos-midia-card__heading">Monitoramento Web</span>
                <p className="tipos-midia-card__tagline">
                  Nacional e Internacional podem ficar ativos ao mesmo tempo.
                </p>
              </div>
            </div>
            <Toggle
              id="midia-web-master"
              label="Monitoramento Web"
              checked={webAny}
              onChange={setWebMaster}
            />
          </div>
          <div
            className={`tipos-midia-card__footer tipos-midia-card__config-wrap ${!webAny ? 'tipos-midia-card__config-wrap--disabled' : ''}`}
          >
            <div className="tipos-midia-card__config tipos-midia-card__config--checks">
              <label className="tipos-midia-card__check">
                <input
                  type="checkbox"
                  className="tipos-midia-card__check-input"
                  checked={a.webNacionalEnabled}
                  disabled={!webAny}
                  onChange={(e) =>
                    dispatch({
                      type: 'TOGGLE_WEB_NACIONAL',
                      enabled: e.target.checked,
                    })
                  }
                />
                <span>Nacional</span>
              </label>
              <label className="tipos-midia-card__check">
                <input
                  type="checkbox"
                  className="tipos-midia-card__check-input"
                  checked={a.webInternacionalEnabled}
                  disabled={!webAny}
                  onChange={(e) =>
                    dispatch({
                      type: 'TOGGLE_WEB_INTERNACIONAL',
                      enabled: e.target.checked,
                    })
                  }
                />
                <span>Internacional</span>
              </label>
            </div>
          </div>
        </Card>

        <MidiaCard
          icon={Radio}
          title="Rádio"
          description="Cobrança fixa regional (mutuamente exclusiva)."
          enabled={a.radioEnabled}
          onEnabledChange={(v) => dispatch({ type: 'TOGGLE_RADIO', enabled: v })}
          toggleId="midia-radio"
        >
          <RegionButtons
            region={a.radioRegion}
            disabled={!a.radioEnabled}
            onChange={(region) => dispatch({ type: 'SET_RADIO_REGION', region })}
          />
        </MidiaCard>

        <MidiaCard
          icon={Tv}
          title="TV"
          description="Cobrança fixa regional (mutuamente exclusiva)."
          enabled={a.tvEnabled}
          onEnabledChange={(v) => dispatch({ type: 'TOGGLE_TV', enabled: v })}
          toggleId="midia-tv"
        >
          <RegionButtons
            region={a.tvRegion}
            disabled={!a.tvEnabled}
            onChange={(region) => dispatch({ type: 'SET_TV_REGION', region })}
          />
        </MidiaCard>

        <MidiaCard
          icon={ThumbsUp}
          title="Mídias sociais"
          description="Selecione a faixa por quantidade de posts."
          enabled={a.midiasSociaisEnabled}
          onEnabledChange={(v) =>
            dispatch({ type: 'TOGGLE_MIDIAS_SOCIAIS', enabled: v })
          }
          toggleId="midia-ms"
        >
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
        </MidiaCard>

        <MidiaCard
          icon={Sparkles}
          title="Instagram Stories"
          description="Selecione a faixa por quantidade de perfis."
          enabled={a.storiesInstagramEnabled}
          onEnabledChange={(v) =>
            dispatch({ type: 'TOGGLE_STORIES_INSTAGRAM', enabled: v })
          }
          toggleId="midia-ig"
        >
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
        </MidiaCard>
      </div>

      <div className="tipos-midia-page__hint-banner" role="note">
        <span className="tipos-midia-page__hint-banner-icon" aria-hidden>
          <Info size={18} strokeWidth={2} />
        </span>
        <p className="tipos-midia-page__hint-banner-text">
          Os monitoramentos com cobrança fixa (Impresso, Rádio e TV) seguem a tabela de preços.
          Em <strong>Rádio</strong> e <strong>TV</strong>, a região (SP + RJ ou Nacional) é uma de cada vez.
          Em <strong>Web</strong>, Nacional e Internacional podem ficar ativos juntos.
        </p>
      </div>
    </div>
  )
}
