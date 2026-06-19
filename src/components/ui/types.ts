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

