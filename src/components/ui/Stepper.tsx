import './Stepper.css'

export interface StepperStep {
  title: string
  subtitle: string
}

interface StepperProps {
  steps: StepperStep[]
  currentIndex: number
}

export function Stepper({ steps, currentIndex }: StepperProps) {
  return (
    <nav className="stepper" aria-label="Etapas da proposta">
      <ol className="stepper__list">
        {steps.map((s, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <li
              key={s.title}
              className={[
                'stepper__item',
                done ? 'stepper__item--done' : '',
                active ? 'stepper__item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="stepper__badge">{i + 1}</span>
              <span className="stepper__text">
                <span className="stepper__title">{s.title}</span>
                <span className="stepper__subtitle">{s.subtitle}</span>
              </span>
              {i < steps.length - 1 ? (
                <span className="stepper__connector" aria-hidden />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
