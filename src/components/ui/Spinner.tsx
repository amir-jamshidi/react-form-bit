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
    >
      <span className="rfb-ui-spinner__ring" />
      <span className="rfb-ui-spinner__core" />
    </span>
  );
};

export default Spinner;
