"use client";

interface MobileTopBarProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export function MobileTopBar({ title, subtitle, rightSlot }: MobileTopBarProps) {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-stone-950 border-b border-stone-800 px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-base leading-none">{title}</h1>
          {subtitle && <p className="text-stone-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {rightSlot && <div>{rightSlot}</div>}
      </div>
    </header>
  );
}
