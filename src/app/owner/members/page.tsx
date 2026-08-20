import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getOwnerGymId, getGymMembers } from "@/lib/db/queries/owner";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import Link from "next/link";
import { Suspense } from "react";

export default async function OwnerMembers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  const gymId = await getOwnerGymId(session.userId);
  if (!gymId) redirect("/login");

  const { q = "" } = await searchParams;
  const members = await getGymMembers(gymId, q);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-3xl">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Members</h1>
          <p className="text-sm text-stone-400 mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} in your gym
          </p>
        </div>
        <Link
          href="/owner/members/new"
          className="shrink-0 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </Link>
      </div>

      <div className="mb-5">
        <Suspense fallback={null}>
          <SearchInput placeholder="Search by name or email..." />
        </Suspense>
      </div>

      <Card padding={false}>
        {members.length === 0 ? (
          <EmptyState
            title={q ? "No members match your search" : "No members yet"}
            description={q ? "Try a different name or email." : "Add your first member using the button above."}
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {members.map((m) => (
              <Link
                key={m.memberId}
                href={`/owner/members/${m.memberId}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-stone-800/50 transition-colors group"
              >
                <Avatar name={m.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-200 group-hover:text-white transition-colors truncate">
                      {m.name}
                    </p>
                    <Badge variant={m.status === "active" ? "green" : "stone"}>
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">{m.email}</p>
                  {m.goal && (
                    <p className="text-xs text-stone-600 mt-0.5">{m.goal}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-stone-600 group-hover:text-stone-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
