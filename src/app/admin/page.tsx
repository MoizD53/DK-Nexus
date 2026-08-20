import { getAdminStats, getAllGymsWithDetails } from "@/lib/db/queries/admin";
import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ListItem } from "@/components/ui/ListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export default async function AdminOverview() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/login");

  const [stats, gyms] = await Promise.all([
    getAdminStats(),
    getAllGymsWithDetails(),
  ]);

  const statItems = [
    { label: "Total Gyms", value: stats.totalGyms, sublabel: "Registered on platform" },
    { label: "Active Gyms", value: stats.activeGyms, sublabel: "With active members" },
    { label: "Total Members", value: stats.totalMembers, sublabel: "Across all gyms" },
    { label: "Active Members", value: stats.activeMembers, sublabel: "Status: active" },
    { label: "Workouts Today", value: stats.workoutsToday, sublabel: "Logged sessions" },
  ];

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-stone-400 mt-1">Platform summary for DuoKarma</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4 mb-8">
        {statItems.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sublabel={s.sublabel} />
        ))}
      </div>

      <div>
        <SectionHeader
          title="Registered Gyms"
          subtitle="All gyms on the platform"
          action={
            <Link href="/admin/gyms" className="text-xs text-amber-500 hover:text-amber-400">
              View all
            </Link>
          }
        />
        <Card padding={false}>
          {gyms.length === 0 ? (
            <EmptyState title="No gyms registered yet" />
          ) : (
            <div className="px-5">
              {gyms.slice(0, 5).map((gym) => (
                <ListItem
                  key={gym.id}
                  title={gym.name}
                  subtitle={`Owner: ${gym.ownerName} · ${gym.memberCount} member${gym.memberCount !== 1 ? "s" : ""}`}
                  badge={gym.activeMemberCount > 0 ? "Active" : "Inactive"}
                  badgeVariant={gym.activeMemberCount > 0 ? "green" : "stone"}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
