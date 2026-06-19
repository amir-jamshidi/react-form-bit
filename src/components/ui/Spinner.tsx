import { cn } from "../../utils/cn";

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <span
      aria-hidden="true"
      className={cn("rfb-ui-spinner inline-flex", className)}
    />
  );
};

export default Spinner;

