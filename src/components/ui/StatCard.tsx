import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, sublabel, icon }: StatCardProps) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-3xl font-semibold text-white leading-none">
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-stone-500 mt-2">{sublabel}</p>
          )}
        </div>
        {icon && (
          <div className="text-amber-600 shrink-0">{icon}</div>
        )}
      </div>
    </div>
  );
}
