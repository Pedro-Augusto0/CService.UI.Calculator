import { SelectField } from '../ui/SelectField'
import { TextField } from '../ui/TextField'
import { Toggle } from '../ui/Toggle'
import './OperationalParams.css'

interface OperationalParamsProps {
  enviosDiarios: number
  numDestinatarios: number
  envioFeriadosFds: boolean
  aprovacaoAutomatica: boolean
  onEnviosDiarios: (n: number) => void
  onNumDestinatarios: (n: number) => void
  onEnvioFeriadosFds: (v: boolean) => void
  onAprovacaoAutomatica: (v: boolean) => void
}

export function OperationalParams({
  enviosDiarios,
  numDestinatarios,
  envioFeriadosFds,
  aprovacaoAutomatica,
  onEnviosDiarios,
  onNumDestinatarios,
  onEnvioFeriadosFds,
  onAprovacaoAutomatica,
}: OperationalParamsProps) {
  return (
    <section className="operational-params">
      <h3 className="operational-params__title">Parâmetros operacionais</h3>
      <div className="operational-params__grid">
        <SelectField
          dense
          id="envios-diarios"
          label="Número de envios diários"
          value={enviosDiarios}
          onChange={(e) =>
            onEnviosDiarios(Number.parseInt(e.target.value, 10) || 0)
          }
        >
          {Array.from({ length: 13 }, (_, i) => i).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </SelectField>
        <TextField
          dense
          id="destinatarios"
          label="Número de destinatários"
          type="number"
          min={0}
          step={1}
          value={numDestinatarios || ''}
          onChange={(e) =>
            onNumDestinatarios(Number.parseInt(e.target.value, 10) || 0)
          }
        />
      </div>
      <div className="operational-params__toggles">
        <Toggle
          checked={envioFeriadosFds}
          onChange={onEnvioFeriadosFds}
          label="Envio em fins de semana / feriados"
          description="+25% no subtotal variável; newsletter usa 30 dias."
        />
        <Toggle
          checked={aprovacaoAutomatica}
          onChange={onAprovacaoAutomatica}
          label="Aprovação automática"
          description="−40% aplicado em sequência após o acréscimo de fins de semana."
        />
      </div>
    </section>
  )
}
