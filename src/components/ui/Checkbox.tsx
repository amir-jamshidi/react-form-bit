import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import FieldMessage from "./FieldMessage";
import {
  resolveValidationState,
  type UIControlBaseProps,
} from "./types";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    UIControlBaseProps {
  label?: ReactNode;
  description?: ReactNode;
  showMessage?: boolean;
}

const Checkbox = ({
  className,
  size = "md",
  validationState = "default",
  error,
  hint,
  disabled,
  label,
  description,
  showMessage = true,
  id,
  ...props
}: CheckboxProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const messageId = `${inputId}-message`;
  const state = resolveValidationState(validationState, error);

  return (
    <div className={["rfb-ui-field", className].filter(Boolean).join(" ")}>
      <label
        htmlFor={inputId}
        className="rfb-ui-checkbox"
        data-size={size}
        data-state={state}
        data-disabled={disabled}
      >
        <input
          id={inputId}
          type="checkbox"
          className="rfb-ui-checkbox__input"
          aria-invalid={state === "error" || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          disabled={disabled}
          {...props}
        />
        <span className="rfb-ui-checkbox__indicator" aria-hidden="true">
          <svg viewBox="0 0 16 16" className="rfb-ui-checkbox__icon">
            <path
              d="M3 8.5 6.2 11.5 13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {(label || description) && (
          <span className="rfb-ui-checkbox__content">
            {label && <span className="rfb-ui-checkbox__label">{label}</span>}
            {description && (
              <span className="rfb-ui-checkbox__description">
                {description}
              </span>
            )}
          </span>
        )}
      </label>
      {showMessage && (
        <FieldMessage id={messageId} error={error} hint={hint} />
      )}
    </div>
  );
};

export default Checkbox;
