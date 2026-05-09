import { PortalIcon } from './PortalIcon';
import type { PortalIconName } from './PortalIcon';

type Step = {
  label: string;
  icon: PortalIconName;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
};

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={step.label}
            className={`step-indicator__item ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
          >
            <div className="step-indicator__icon-wrapper">
              <PortalIcon name={step.icon} />
              <span className="step-indicator__label">{step.label}</span>
            </div>
            {index < steps.length - 1 && <div className="step-indicator__line" />}
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;
