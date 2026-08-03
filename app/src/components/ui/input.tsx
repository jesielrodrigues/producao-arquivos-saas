import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-base-border bg-base-elevated px-3.5 text-sm text-ink placeholder:text-ink-faint",
        "outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
