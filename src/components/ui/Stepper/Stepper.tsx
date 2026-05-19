import './Stepper.css'

export interface StepperStep {
  title: string
  subtitle: string
}

interface StepperProps {
  steps: StepperStep[]
  currentIndex: number
  /** Quando definido, cada etapa vira botão clicável (ir para esta etapa). */
  onStepChange?: (index: number) => void
}

export function Stepper({ steps, currentIndex, onStepChange }: StepperProps) {
  return (
    <nav className="stepper" aria-label="Etapas da proposta">
      <ol className="stepper__list">
        {steps.map((s, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          const itemClass = [
            'stepper__item',
            done ? 'stepper__item--done' : '',
            active ? 'stepper__item--active' : '',
          ]
            .filter(Boolean)
            .join(' ')
          const body = (
            <>
              <span className="stepper__badge">{i + 1}</span>
              <span className="stepper__text">
                <span className="stepper__title">{s.title}</span>
                <span className="stepper__subtitle">{s.subtitle}</span>
              </span>
              {i < steps.length - 1 ? (
                <span className="stepper__connector" aria-hidden />
              ) : null}
            </>
          )
          return (
            <li key={`${s.title}-${i}`} className="stepper__cell">
              {onStepChange ? (
                <button
                  type="button"
                  className={itemClass}
                  onClick={() => onStepChange(i)}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`Ir para etapa ${i + 1}: ${s.title}`}
                >
                  {body}
                </button>
              ) : (
                <div className={itemClass}>{body}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
