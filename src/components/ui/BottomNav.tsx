"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-stone-950 border-t border-stone-800 safe-area-bottom">
      <div className="flex items-stretch">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 transition-colors duration-100 min-h-[56px] ${
                active ? "text-amber-500" : "text-stone-500"
              }`}
            >
              <span className="w-5 h-5">{active && item.activeIcon ? item.activeIcon : item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
