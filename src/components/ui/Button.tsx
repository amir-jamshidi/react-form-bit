import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const Button = ({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      className={["rfb-ui-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-disabled={isDisabled}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner className="rfb-ui-button__spinner" /> : leadingIcon}
      {children && <span className="rfb-ui-button__label">{children}</span>}
      {!loading && trailingIcon}
    </button>
  );
};

export default Button;
