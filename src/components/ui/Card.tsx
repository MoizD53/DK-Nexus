import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div
      className={`bg-stone-900 border border-stone-800 rounded-lg ${
        padding ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
