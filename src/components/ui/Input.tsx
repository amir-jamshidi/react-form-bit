import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import FieldMessage from "./FieldMessage";
import Spinner from "./Spinner";
import {
  resolveValidationState,
  type UIControlBaseProps,
} from "./types";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    UIControlBaseProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  showMessage?: boolean;
}

const Input = ({
  className,
  size = "md",
  variant = "default",
  validationState = "default",
  error,
  hint,
  loading,
  disabled,
  startAdornment,
  endAdornment,
  showMessage = true,
  id,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const messageId = `${inputId}-message`;
  const state = resolveValidationState(validationState, error);

  return (
    <div className={["rfb-ui-field", className].filter(Boolean).join(" ")}>
      <div
        className="rfb-ui-control-shell"
        data-size={size}
        data-variant={variant}
        data-state={state}
        data-disabled={disabled || loading}
      >
        {startAdornment && (
          <span className="rfb-ui-control__adornment">{startAdornment}</span>
        )}
        <input
          id={inputId}
          className="rfb-ui-input"
          aria-invalid={state === "error" || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          disabled={disabled || loading}
          {...props}
        />
        {loading ? (
          <span className="rfb-ui-control__adornment">
            <Spinner />
          </span>
        ) : (
          endAdornment && (
            <span className="rfb-ui-control__adornment">{endAdornment}</span>
          )
        )}
      </div>
      {showMessage && (
        <FieldMessage id={messageId} error={error} hint={hint} />
      )}
    </div>
  );
};

export default Input;
