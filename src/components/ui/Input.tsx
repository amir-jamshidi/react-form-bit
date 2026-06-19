import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import FieldMessage from "./FieldMessage";
import Spinner from "./Spinner";
import type { UIControlBaseProps } from "./types";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    UIControlBaseProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
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
  id,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const messageId = `${inputId}-message`;
  const state = error && validationState === "default" ? "error" : validationState;

  return (
    <div className={cn("rfb-ui-field", className)}>
      <div
        className={cn(
          "rfb-ui-control-shell",
          `rfb-ui-control-shell--${size}`,
          `rfb-ui-control-shell--${variant}`,
          `is-${state}`,
          (disabled || loading) && "is-disabled"
        )}
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
          <Spinner className="rfb-ui-control__adornment" />
        ) : (
          endAdornment && (
            <span className="rfb-ui-control__adornment">{endAdornment}</span>
          )
        )}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
};

export default Input;
