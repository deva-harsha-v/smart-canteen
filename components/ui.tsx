"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const VARIANT: Record<string, string> = {
  primary:
    "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0",
  secondary:
    "bg-ink/5 text-ink border border-ink/10 hover:bg-ink/10 hover:border-ink/20",
  ghost: "text-ink/70 hover:text-ink hover:bg-ink/5",
  danger:
    "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
};

const SIZE: Record<string, string> = {
  sm: "px-3.5 py-2 text-sm rounded-xl",
  md: "px-5 py-3 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cx(
        "relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none",
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={cx(
        "w-full px-4 py-3 rounded-xl bg-black/[0.04] border border-ink/10 outline-none text-ink placeholder:text-ink/30 transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/15",
        className
      )}
      {...rest}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "bg-surface/70 border border-ink/[0.06] rounded-2xl backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

const BADGE_TONE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-sky-50 text-sky-700 border-sky-200",
  preparing: "bg-violet-50 text-violet-700 border-violet-200",
  ready: "bg-cyan-50 text-cyan-700 border-cyan-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-ink/5 text-ink/50 border-ink/10",
  default: "bg-ink/5 text-ink/70 border-ink/10",
};

export function Badge({ tone = "default", children }: { tone?: string; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize",
        BADGE_TONE[tone] ?? BADGE_TONE.default
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "animate-pulse bg-ink/[0.06] rounded-xl",
        className
      )}
    />
  );
}

export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <Loader2
      size={size}
      className="animate-spin text-primary"
      strokeWidth={2.5}
    />
  );
}

export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-ink/50">
      <Spinner />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-ink/5 border border-ink/10 flex items-center justify-center mb-5 text-ink/40">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink/90">{title}</h3>
      {description && (
        <p className="text-sm text-ink/40 mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
