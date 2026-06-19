import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface FieldMessageProps {
  id?: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

const FieldMessage = ({ id, error, hint, className }: FieldMessageProps) => {
  if (!error && !hint) return null;

  return (
    <div
      id={id}
      className={cn("rfb-ui-message text-xs mt-2", error && "is-error", className)}
      aria-live={error ? "polite" : undefined}
    >
      {error || hint}
    </div>
  );
};

export default FieldMessage;

