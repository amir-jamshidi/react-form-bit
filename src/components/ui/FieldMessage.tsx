import type { ReactNode } from "react";

interface FieldMessageProps {
  id?: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

const FieldMessage = ({ id, error, hint, className }: FieldMessageProps) => {
  const content = error || hint;

  return (
    <div
      id={id}
      data-has-error={Boolean(error)}
      data-empty={!content}
      className={["rfb-ui-message text-xs mt-1", className]
        .filter(Boolean)
        .join(" ")}
      aria-live={error ? "polite" : undefined}
      aria-hidden={!content || undefined}
    >
      {content || "\u00A0"}
    </div>
  );
};

export default FieldMessage;
