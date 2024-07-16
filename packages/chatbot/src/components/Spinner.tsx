import { Loader } from "./icons";

interface SpinnerProps {
  color?: string;
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 25,
  color = "#fff",
}) => {
  return (
    <Loader
      className="animate-spin"
      size={size ?? 15}
      color={color ?? "#000"}
    />
  );
};
