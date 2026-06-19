import type { ReactNode } from "react";

export type UIControlSize = "sm" | "md" | "lg";
export type UIControlVariant = "default" | "ghost";
export type UIValidationState = "default" | "error" | "success";

export interface UIControlBaseProps {
  size?: UIControlSize;
  variant?: UIControlVariant;
  validationState?: UIValidationState;
  error?: string;
  hint?: ReactNode;
  loading?: boolean;
  className?: string;
}

export const resolveValidationState = (
  validationState: UIValidationState = "default",
  error?: string
): UIValidationState => {
  if (error && validationState === "default") {
    return "error";
  }

  return validationState;
};
