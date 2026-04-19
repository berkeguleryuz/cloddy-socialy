"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    hint,
    error,
    leftIcon,
    rightSlot,
    className,
    containerClassName,
    disabled,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
    ? `${inputId}-hint`
    : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-black uppercase tracking-wider text-text-muted"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-background transition-colors",
          error
            ? "border-accent-orange"
            : "border-border focus-within:border-primary"
        )}
      >
        {leftIcon && (
          <span className="pl-4 text-text-muted" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full bg-transparent py-3 text-sm text-text-main placeholder:text-text-muted/70 focus:outline-none disabled:opacity-50",
            leftIcon ? "pl-3" : "pl-4",
            rightSlot ? "pr-3" : "pr-4",
            className
          )}
          {...rest}
        />
        {rightSlot && <span className="pr-3">{rightSlot}</span>}
      </div>
      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs font-medium text-accent-orange"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
