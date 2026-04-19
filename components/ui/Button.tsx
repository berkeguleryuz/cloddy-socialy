"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary/85 active:bg-primary/70 shadow-sm",
        secondary:
          "bg-secondary text-white hover:bg-secondary/85 active:bg-secondary/70",
        accent:
          "bg-accent-blue text-white hover:bg-accent-blue/85 active:bg-accent-blue/70",
        danger:
          "bg-accent-orange text-white hover:bg-accent-orange/85 active:bg-accent-orange/70",
        outline:
          "border border-border bg-transparent text-text-main hover:bg-surface hover:border-primary/60 active:bg-surface/80",
        ghost:
          "bg-transparent text-text-muted hover:bg-surface hover:text-text-main active:bg-surface/80",
        link:
          "bg-transparent text-primary underline-offset-4 hover:underline px-0 py-0 uppercase-[initial] tracking-normal font-medium",
      },
      size: {
        sm: "h-8 px-3 text-[10px]",
        md: "h-10 px-5 text-xs",
        lg: "h-12 px-7 text-sm",
        icon: "h-10 w-10 p-0",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

function Spinner({ size }: { size: "sm" | "md" | "lg" | "icon" | null }) {
  const dim = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <svg
      className={cn("animate-spin", dim)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="40 20"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      block,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(buttonStyles({ variant, size, block }), className)}
        {...rest}
      >
        {loading ? <Spinner size={size ?? "md"} /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
