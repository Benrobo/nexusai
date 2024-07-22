import PropTypes from "prop-types";

interface CircularProgressBarProps {
  percentages: { color: string; value: number }[];
  size: number;
  strokeWidth: number;
  text: string;
}

const CircularProgressBar = ({
  percentages,
  size,
  strokeWidth,
  text,
}: CircularProgressBarProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const svgStyle = {
    display: "block",
    margin: "0 auto",
  };

  const circleBgStyle = {
    stroke: "#e6e6e6",
    strokeLinecap: "round",
  };

  const getCircleStyle = (color: string, percentage: number) => ({
    stroke: color,
    strokeLinecap: "round",
    transition: "stroke-dashoffset 1s ease-in-out",
    transform: "rotate(-90deg)",
    transformOrigin: "50% 50%",
    strokeDasharray: circumference,
    strokeDashoffset: circumference - (percentage / 100) * circumference,
  });

  const textStyle = {
    fill: "#000",
    fontSize: "15px",
    textAnchor: "middle",
    dy: ".3em",
  };

  return (
    <svg width={size} height={size} style={svgStyle}>
      <circle
        // @ts-ignore
        style={circleBgStyle}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {percentages.map((percentage, index) => (
        <circle
          key={index}
          // @ts-ignore
          style={getCircleStyle(percentage.color, percentage.value)}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className=""
        />
      ))}
      {/* @ts-expect-error */}
      <text x="50%" y="50%" style={textStyle} className="font-ppM text-xs">
        {text}
      </text>
    </svg>
  );
};

CircularProgressBar.propTypes = {
  percentages: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  size: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
};

export default CircularProgressBar;
