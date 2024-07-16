import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface FlexProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  className?: React.ComponentProps<"div">["className"];
}

export function FlexColStart({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex flex-col items-start justify-start gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexColEnd({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex flex-col items-end justify-end gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexColCenter({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex flex-col items-center justify-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexColStartCenter({
  children,
  className,
  ...props
}: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex flex-col items-center justify-start gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowStart({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex items-start justify-start gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowStartCenter({
  children,
  className,
  ...props
}: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex items-center justify-start gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowEnd({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge("w-auto flex items-end justify-end gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowStretch({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex items-stretch justify-start gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowEndCenter({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex items-center justify-end gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowStartBtw({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex items-start justify-between gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowCenter({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex items-center justify-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FlexRowCenterBtw({ children, className, ...props }: FlexProps) {
  return (
    <div
      className={twMerge(
        "w-auto flex items-center justify-between gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
