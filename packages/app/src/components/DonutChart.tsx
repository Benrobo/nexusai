import React from "react";

interface Segment {
  color: string;
  value: number;
  label: string;
}

interface DonutChartProps {
  centeredChildren: React.ReactNode;
  segments: Segment[];
  size: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  centeredChildren,
  segments,
  size,
}) => {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const gapAngle = 0.05; // Adjust this value to change the gap size

  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0);
  let startAngle = 0;

  const createSegment = (segment: Segment, index: number) => {
    const percentage = (segment.value / totalValue) * 100;
    const sweepAngle = (percentage / 100) * 2 * Math.PI - gapAngle;

    const startX = center + radius * Math.cos(startAngle + gapAngle / 2);
    const startY = center + radius * Math.sin(startAngle + gapAngle / 2);
    const endX =
      center + radius * Math.cos(startAngle + sweepAngle + gapAngle / 2);
    const endY =
      center + radius * Math.sin(startAngle + sweepAngle + gapAngle / 2);

    const largeArcFlag = sweepAngle > Math.PI ? 1 : 0;

    const d = [
      `M ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    ].join(" ");

    startAngle += sweepAngle + gapAngle;

    return (
      <path
        key={index}
        d={d}
        fill="none"
        stroke={segment.color}
        strokeWidth={strokeWidth}
      />
    );
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="">
        <g transform={`rotate(-90 ${center} ${center})`}>
          {segments.map((segment, index) => createSegment(segment, index))}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centeredChildren}
      </div>
    </div>
  );
};

export default DonutChart;
