import {
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import FieldMessage from "./FieldMessage";
import Spinner from "./Spinner";
import {
  resolveValidationState,
  type UIControlBaseProps,
} from "./types";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    UIControlBaseProps {
  endAdornment?: ReactNode;
  showMessage?: boolean;
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
  showMessage = true,
  id,
  rows = 4,
  ...props
}: TextareaProps) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const messageId = `${textareaId}-message`;
  const state = resolveValidationState(validationState, error);

  return (
    <div className={["rfb-ui-field", className].filter(Boolean).join(" ")}>
      <div
        className="rfb-ui-control-shell rfb-ui-control-shell--textarea"
        data-size={size}
        data-variant={variant}
        data-state={state}
        data-disabled={disabled || loading}
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
      {showMessage && (
        <FieldMessage id={messageId} error={error} hint={hint} />
      )}
    </div>
  );
};

export default Textarea;
