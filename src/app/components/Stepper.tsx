import React from 'react';

export interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="stepper-horizontal">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;
        const stepNumber = `Step ${index + 1}`;

        return (
          <div key={index} className="stepper-horizontal-step">
            <div className="stepper-horizontal-indicator">
              <div className={`stepper-horizontal-circle ${isCompleted ? 'stepper-horizontal-circle-completed' : ''} ${isActive ? 'stepper-horizontal-circle-active' : ''}`}>
                {isCompleted ? (
                  <i className="fa-solid fa-check"></i>
                ) : isActive ? (
                  <i className="fa-solid fa-pen"></i>
                ) : null}
              </div>
              {!isLast && (
                <div className={`stepper-horizontal-line ${isCompleted ? 'stepper-horizontal-line-completed' : ''}`} />
              )}
            </div>
            <div className={`stepper-horizontal-label ${isCompleted ? 'stepper-horizontal-label-completed' : ''} ${isActive ? 'stepper-horizontal-label-active' : ''}`}>
              <div className="stepper-horizontal-title" title={`${stepNumber}: ${step.label}`}>
                <span className="stepper-title-full">{stepNumber}</span>
              </div>
              {step.label && (
                <div className="stepper-horizontal-description" title={step.label}>{step.label}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
