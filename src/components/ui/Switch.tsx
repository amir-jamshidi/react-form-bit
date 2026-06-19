import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import FieldMessage from "./FieldMessage";
import {
  resolveValidationState,
  type UIControlBaseProps,
} from "./types";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "role">,
    UIControlBaseProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  showMessage?: boolean;
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
  showMessage = true,
  id,
  type = "button",
  ...props
}: SwitchProps) => {
  const generatedId = useId();
  const switchId = id || generatedId;
  const messageId = `${switchId}-message`;
  const state = resolveValidationState(validationState, error);

  return (
    <div className={["rfb-ui-field", className].filter(Boolean).join(" ")}>
      <div
        className="rfb-ui-switch"
        data-size={size}
        data-state={state}
        data-disabled={disabled}
      >
        <button
          id={switchId}
          type={type}
          role="switch"
          aria-checked={checked}
          aria-invalid={state === "error" || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className="rfb-ui-switch__control"
          data-checked={checked}
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
      {showMessage && (
        <FieldMessage id={messageId} error={error} hint={hint} />
      )}
    </div>
  );
};

export default Switch;
