import { PropsWithChildren } from "react";
import { SvgIconProps } from "./icon.types";
import { cn } from "@/lib/utils";
import defaultIcoAttributes from "./icon.types";

interface IconProps extends PropsWithChildren {}

const IconMarkup = (props: IconProps & SvgIconProps) => {
  return (
    <svg
      {...defaultIcoAttributes}
      width={props?.size ?? 24}
      height={props?.size ?? 24}
      fill={props?.fill ?? "none"}
      stroke={props?.color ?? "#fff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props?.strokeWidth ?? 2}
      className={cn(props?.className)}
      ref={props?.ref}
      {...props}
    >
      {props?.children}
    </svg>
  );
};

export default IconMarkup;
