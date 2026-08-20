"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DesktopSidebarProps {
  navItems: NavItem[];
  logoLabel: string;
  logoSub?: string;
  logoutAction: () => void | Promise<void>;
}

export function DesktopSidebar({
  navItems,
  logoLabel,
  logoSub,
  logoutAction,
}: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-stone-900 border-r border-stone-800 min-h-screen fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-stone-800">
        <p className="text-white font-semibold text-base leading-none">{logoLabel}</p>
        {logoSub && (
          <p className="text-stone-500 text-xs mt-1">{logoSub}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-100 ${
                active
                  ? "bg-amber-600/15 text-amber-500"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              }`}
            >
              <span className={`shrink-0 ${active ? "text-amber-500" : "text-stone-500"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-stone-800">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors duration-100"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
