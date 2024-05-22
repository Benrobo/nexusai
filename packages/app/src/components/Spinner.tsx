interface SpinnerProps {
  color?: string;
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 25,
  color = "#fff",
}) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderTopColor: `${color ?? "#fff"}`,
    borderRightColor: `${color ?? "#fff"}`,
    borderBottomColor: `transparent`,
    borderLeftColor: `transparent`,
    // borderColor: `${color}`,
  };

  return (
    <div
      id="loading-spinner"
      className="rounded-full border-[3px] animate-spin-fast"
      style={spinnerStyle}
    ></div>
  );
};
