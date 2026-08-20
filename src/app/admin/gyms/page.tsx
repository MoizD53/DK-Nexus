import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getAllGymsWithDetails } from "@/lib/db/queries/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";

export default async function AdminGyms() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/login");

  const gyms = await getAllGymsWithDetails();

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Gyms</h1>
        <p className="text-sm text-stone-400 mt-1">
          {gyms.length} gym{gyms.length !== 1 ? "s" : ""} registered on the platform
        </p>
      </div>

      <Card padding={false}>
        {gyms.length === 0 ? (
          <EmptyState
            title="No gyms registered yet"
            description="Gyms appear here once owners are onboarded."
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {gyms.map((gym) => (
              <div key={gym.id} className="flex items-start gap-4 px-5 py-4">
                <Avatar name={gym.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{gym.name}</p>
                    <Badge variant={gym.activeMemberCount > 0 ? "green" : "stone"}>
                      {gym.activeMemberCount > 0 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Owner: {gym.ownerName}
                    {gym.ownerEmail && (
                      <span className="text-stone-600"> · {gym.ownerEmail}</span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {gym.memberCount} total · {gym.activeMemberCount} active
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
