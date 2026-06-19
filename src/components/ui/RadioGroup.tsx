import { useId } from "react";
import { cn } from "../../utils/cn";
import type { IOption } from "../../types";
import FieldMessage from "./FieldMessage";
import type { UIControlBaseProps } from "./types";

export interface RadioGroupProps extends UIControlBaseProps {
  name: string;
  value?: string;
  options: IOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const RadioGroup = ({
  className,
  size = "md",
  validationState = "default",
  error,
  hint,
  disabled,
  name,
  value,
  options,
  onValueChange,
  orientation = "vertical",
  id,
  ...ariaProps
}: RadioGroupProps) => {
  const generatedId = useId();
  const groupId = id || generatedId;
  const messageId = `${groupId}-message`;
  const state =
    error && validationState === "default" ? "error" : validationState;

  return (
    <div className={cn("rfb-ui-field", className)}>
      <div
        role="radiogroup"
        id={groupId}
        aria-invalid={state === "error" || undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          "rfb-ui-radio-group",
          `rfb-ui-radio-group--${orientation}`,
          `rfb-ui-radio-group--${size}`,
          `is-${state}`,
          disabled && "is-disabled"
        )}
        {...ariaProps}
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const checked = value === option.value;

          return (
            <label key={option.value} htmlFor={optionId} className="rfb-ui-radio">
              <input
                id={optionId}
                className="rfb-ui-radio__input"
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onValueChange(option.value)}
              />
              <span className="rfb-ui-radio__indicator" aria-hidden="true">
                <span className="rfb-ui-radio__dot" />
              </span>
              <span className="rfb-ui-radio__label">{option.label}</span>
            </label>
          );
        })}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
};

export default RadioGroup;
