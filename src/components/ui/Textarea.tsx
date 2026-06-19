import {
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";
import FieldMessage from "./FieldMessage";
import Spinner from "./Spinner";
import type { UIControlBaseProps } from "./types";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    UIControlBaseProps {
  endAdornment?: ReactNode;
}

const Textarea = ({
  className,
  size = "md",
  variant = "default",
  validationState = "default",
  error,
  hint,
  loading,
  disabled,
  endAdornment,
  id,
  rows = 4,
  ...props
}: TextareaProps) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const messageId = `${textareaId}-message`;
  const state = error && validationState === "default" ? "error" : validationState;

  return (
    <div className={cn("rfb-ui-field", className)}>
      <div
        className={cn(
          "rfb-ui-control-shell rfb-ui-control-shell--textarea",
          `rfb-ui-control-shell--${size}`,
          `rfb-ui-control-shell--${variant}`,
          `is-${state}`,
          (disabled || loading) && "is-disabled"
        )}
      >
        <textarea
          id={textareaId}
          rows={rows}
          className="rfb-ui-textarea"
          aria-invalid={state === "error" || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          disabled={disabled || loading}
          {...props}
        />
        {loading ? (
          <Spinner className="rfb-ui-control__floating-adornment" />
        ) : (
          endAdornment && (
            <span className="rfb-ui-control__floating-adornment">
              {endAdornment}
            </span>
          )
        )}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
};

export default Textarea;
