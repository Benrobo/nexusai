export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: React.SVGProps<SVGSVGElement>["className"];
  ref?: React.SVGProps<SVGSVGElement>["ref"];
}

export default {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
