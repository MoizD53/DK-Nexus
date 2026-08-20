import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getMemberProfile } from "@/lib/db/queries/member";
import { ProfileClient } from "./ProfileClient";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { logoutAction } from "@/app/logoutAction";

export default async function MemberProfile() {
  // userId from session — member can only ever see their own profile
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");

  const profile = await getMemberProfile(session.userId);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Profile</h1>
        <p className="text-sm text-stone-400 mt-1">Your account and fitness details</p>
      </div>

      {!profile ? (
        <Card padding={false}>
          <EmptyState
            title="Profile not found"
            description="Your member profile could not be loaded. Please contact your gym."
          />
        </Card>
      ) : (
        <ProfileClient profile={profile} />
      )}

      {/* Mobile logout */}
      <div className="mt-6 lg:hidden">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
