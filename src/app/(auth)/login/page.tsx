"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold text-white">DK-Nexus</h1>
          <p className="text-stone-400 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Error */}
        {state?.error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-stone-400 mb-2 uppercase tracking-widest"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-600 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-stone-400 mb-2 uppercase tracking-widest"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-600 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-3.5 px-6 rounded-md transition-colors duration-150 mt-2"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
