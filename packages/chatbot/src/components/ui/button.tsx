import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative px-4 py-3 flex items-center justify-center gap-5 w-fit h-[48px] rounded-sm font-ppReg text-white-100",
  {
    variants: {
      intent: {
        primary:
          "bg-blue-100 hover:bg-blue-100/90 disabled:bg-white-100/70 disabled:cursor-not-allowed disabled:text-white-400 text-white-100",
        secondary:
          "bg-white-100 text-brand-green-primary hover:bg-[#F4FBF6] focus:shadow-brand-green-shd active:bg-brand-green-shd disabled:bg-brand-disabled border-solid border-[2px] border-brand-green-primary ",
        success:
          "bg-success-primary hover:bg-brand-success-hover focus:bg-brand-success-focused active:bg-brand-success-pressed disabled:bg-brand-disabled disabled:cursor-not-allowed ",
        tertiary:
          "bg-green-ttr text-brand-green-primary hover:bg-[#F4FBF6] focus:shadow-brand-green-shd active:bg-brand-green-shd disabled:bg-brand-disabled disabled:cursor-not-allowed ",
        error:
          "bg-red-305 text-white-100 hover:bg-red-305/50 focus:bg-red-305 active:bg-red-305 disabled:bg-red-305/30 disabled:cursor-not-allowed",
        dark: "bg-dark-100/90 text-white-100 hover:bg-dark-100 focus:bg-dark-100 active:bg-dark-100 disabled:bg-brand-disabled disabled:cursor-not-allowed",
      },
      size: {
        sm: "text-sm py-2",
        md: "text-base py-3",
        lg: "text-lg py-4",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export interface ButtonVariants
  extends DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    VariantProps<typeof buttonVariants> {}

export interface ButtonProps extends ButtonVariants {
  children: React.ReactNode;
  className?: React.ComponentProps<"div">["className"];
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  href?: string;
  spinnerColor?: string;
  spinnerSize?: string | number;
  childrenClass?: React.ComponentProps<"div">["className"];
  enableBounceEffect?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  disabled,
  leftIcon,
  rightIcon,
  className,
  href,
  spinnerColor,
  spinnerSize,
  childrenClass,
  enableBounceEffect,
  ...props
}) => {
  const classNames = twMerge(
    buttonVariants(props),
    className,
    enableBounceEffect
      ? "active:scale-[.95] target:scale-[.90] scale-1 transition-all"
      : ""
  );

  if (href) {
    return (
      // @ts-ignore
      <Link to={href} className={cn(classNames, childrenClass)} {...props}>
        {leftIcon && leftIcon}
        {children}
        {rightIcon && rightIcon}
      </Link>
    );
  }

  return (
    <button
      disabled={(isLoading ?? disabled) || disabled}
      className={classNames}
      {...props}
    >
      <div className="w-full h-full absolute top-0 flex flex-col items-center justify-center">
        <svg
          width={spinnerSize ?? "20"}
          height={spinnerSize ?? "20"}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className={twMerge(
            " animate-spin transition delay-[.2] ",
            isLoading ? "opacity-1 visible" : "opacity-0 hidden"
          )}
        >
          <path
            fill={spinnerColor ?? "#fff"}
            d="M12 21a9 9 0 1 1 6.18-15.55a.75.75 0 0 1 0 1.06a.74.74 0 0 1-1.06 0A7.51 7.51 0 1 0 19.5 12a.75.75 0 0 1 1.5 0a9 9 0 0 1-9 9Z"
          />
        </svg>
      </div>
      <div
        className={twMerge(
          "w-auto flex items-center justify-center gap-2",
          isLoading ? "opacity-0" : "opacity-1",
          childrenClass
        )}
      >
        {leftIcon}
        {children}
        {rightIcon && (
          <span
            style={{
              opacity: isLoading ? 0 : 1,
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>
    </button>
  );
};

export default Button;
