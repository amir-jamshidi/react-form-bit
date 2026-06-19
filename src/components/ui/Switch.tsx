import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import FieldMessage from "./FieldMessage";
import type { UIControlBaseProps } from "./types";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "role">,
    UIControlBaseProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
}

const Switch = ({
  className,
  size = "md",
  validationState = "default",
  error,
  hint,
  disabled,
  checked,
  onCheckedChange,
  label,
  description,
  id,
  type = "button",
  ...props
}: SwitchProps) => {
  const generatedId = useId();
  const switchId = id || generatedId;
  const messageId = `${switchId}-message`;
  const state = error && validationState === "default" ? "error" : validationState;

  return (
    <div className={cn("rfb-ui-field", className)}>
      <div
        className={cn(
          "rfb-ui-switch",
          `rfb-ui-switch--${size}`,
          `is-${state}`,
          disabled && "is-disabled"
        )}
      >
        <button
          id={switchId}
          type={type}
          role="switch"
          aria-checked={checked}
          aria-invalid={state === "error" || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn("rfb-ui-switch__control", checked && "is-checked")}
          disabled={disabled}
          onClick={() => {
            if (!disabled) onCheckedChange(!checked);
          }}
          {...props}
        >
          <span className="rfb-ui-switch__thumb" aria-hidden="true" />
        </button>
        {(label || description) && (
          <div className="rfb-ui-switch__content">
            {label && <span className="rfb-ui-switch__label">{label}</span>}
            {description && (
              <span className="rfb-ui-switch__description">{description}</span>
            )}
          </div>
        )}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
};

export default Switch;
