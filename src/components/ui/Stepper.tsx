import { Button } from "./Button";

type StepperProps = {
  label: string;
  value: number;
  helper: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

/** Tarjeta con botones − y + para elegir un número. */
export function Stepper({ label, value, helper, min, max, onChange }: StepperProps) {
  return (
    <div className="stepper-card">
      <div>
        <span className="field-label">{label}</span>
        <span className="field-helper">{helper}</span>
      </div>
      <div className="stepper">
        <Button ariaLabel={`Reducir ${label}`} className="stepper__button" disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </Button>
        <span className="stepper__value">{value}</span>
        <Button ariaLabel={`Aumentar ${label}`} className="stepper__button" disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </Button>
      </div>
    </div>
  );
}