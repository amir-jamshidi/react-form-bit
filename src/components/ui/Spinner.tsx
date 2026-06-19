interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <span
      aria-hidden="true"
      className={["rfb-ui-spinner inline-flex", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
};

export default Spinner;
