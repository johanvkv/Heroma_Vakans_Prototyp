import React from 'react';

export interface VerticalStep {
  label: string;
  content?: string;
}

interface VerticalStepperProps {
  steps: VerticalStep[];
  currentStep: number;
  onBack?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
}

export const VerticalStepper: React.FC<VerticalStepperProps> = ({
  steps,
  currentStep,
  onBack,
  onCancel,
  onNext
}) => {
  return (
    <div className="stepper-vertical">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;
        const stepNumber = `Step ${index + 1}`;

        return (
          <div key={index} className="stepper-vertical-step">
            <div className="stepper-vertical-indicator-wrapper">
              <div className={`stepper-horizontal-circle ${isCompleted ? 'stepper-horizontal-circle-completed' : ''} ${isActive ? 'stepper-horizontal-circle-active' : ''}`}>
                {isCompleted ? (
                  <i className="fa-solid fa-check"></i>
                ) : isActive ? (
                  <i className="fa-solid fa-pen"></i>
                ) : null}
              </div>
              {!isLast && (
                <div className={`stepper-vertical-line ${isCompleted ? 'stepper-vertical-line-completed' : ''}`} />
              )}
            </div>

            <div className="stepper-vertical-content">
              {isActive && step.content ? (
                <div className="stepper-vertical-active-content">
                  <div className={`stepper-vertical-label ${isCompleted ? 'stepper-horizontal-label-completed' : ''} ${isActive ? 'stepper-horizontal-label-active' : ''}`}>
                    {stepNumber}
                  </div>
                  <div className="stepper-vertical-description">
                    {step.content}
                  </div>
                  <div className="stepper-vertical-actions">
                    {onBack && (
                      <button className="btn-tertiary" onClick={onBack}>Back</button>
                    )}
                    {onCancel && (
                      <button className="btn-tertiary" onClick={onCancel}>Cancel</button>
                    )}
                    {onNext && (
                      <button className="btn-primary" onClick={onNext}>Next</button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`stepper-vertical-label ${isCompleted ? 'stepper-horizontal-label-completed' : ''} ${isActive ? 'stepper-horizontal-label-active' : ''}`}>
                  {stepNumber}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
