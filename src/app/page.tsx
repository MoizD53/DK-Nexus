import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold text-white tracking-tight">DK-Nexus</h1>
          <p className="text-stone-400 text-sm mt-3">Premium Fitness Management</p>
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="block w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-medium text-sm text-center py-3.5 px-6 rounded-md transition-colors duration-150"
        >
          Continue
        </Link>

        <p className="text-center text-xs text-stone-600 mt-5">
          Member, Owner &amp; Admin access
        </p>
      </div>
    </div>
  );
}
