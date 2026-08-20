import { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface PremiumButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  formAction?: (formData: FormData) => void | Promise<void>;
  className?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 border-transparent",
  secondary:
    "bg-transparent text-stone-200 border-stone-700 hover:border-stone-500 hover:text-white active:bg-stone-800",
  ghost:
    "bg-transparent text-stone-400 border-transparent hover:text-stone-200 active:text-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
};

export function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled,
  formAction,
  className = "",
}: PremiumButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      formAction={formAction}
      className={`inline-flex items-center justify-center gap-2 font-medium border rounded-md transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
