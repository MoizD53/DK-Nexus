import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getAllMembers } from "@/lib/db/queries/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { SearchInput } from "@/components/ui/SearchInput";
import { Suspense } from "react";

export default async function AdminMembers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/login");

  const { q = "" } = await searchParams;
  const members = await getAllMembers(q);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Members</h1>
        <p className="text-sm text-stone-400 mt-1">
          {members.length} member{members.length !== 1 ? "s" : ""} across all gyms
        </p>
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
            description={q ? "Try a different name or email." : "Members appear here once owners add them."}
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {members.map((m) => (
              <div key={m.memberId} className="flex items-start gap-4 px-5 py-4">
                <Avatar name={m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-200 truncate">{m.name}</p>
                    <Badge variant={m.status === "active" ? "green" : "stone"}>
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">{m.email}</p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {m.gymName}{m.goal ? ` · ${m.goal}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
