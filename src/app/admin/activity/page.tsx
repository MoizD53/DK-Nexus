import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getPlatformActivity } from "@/lib/db/queries/admin";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";

export default async function AdminActivityPage() {
  const session = await getSession();
  if (!session || session.role !== "master_admin") redirect("/login");

  const activity = await getPlatformActivity();

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Platform Activity</h1>
        <p className="text-sm text-stone-400 mt-1">Global view of workout activity and volume across all gyms</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Workouts" value={activity.totalWorkouts} sublabel="All time" />
        <StatCard label="Workouts Today" value={activity.workoutsToday} />
        <StatCard label="This Week" value={activity.workoutsThisWeek} />
        <StatCard label="This Month" value={activity.workoutsThisMonth} />
      </div>

      <h2 className="text-base font-semibold text-white mb-4">Recent Workouts</h2>
      <Card padding={false}>
        {activity.recentWorkouts.length === 0 ? (
          <EmptyState 
            title="No recent workouts" 
            description="Platform workout activity will appear here." 
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {activity.recentWorkouts.map(a => {
              const dateObj = new Date(a.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const isCompleted = a.status === 'completed';
              
              return (
                <div key={a.workoutId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-stone-800/30 transition-colors gap-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 lg:gap-12 flex-1">
                    <div className="min-w-40">
                      <p className="text-sm font-semibold text-stone-200">{a.memberName}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{formattedDate}</p>
                    </div>
                    <div className="min-w-40">
                      <p className="text-sm font-medium text-stone-300">{a.gymName}</p>
                      <p className="text-xs text-stone-500 mt-0.5">Gym</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{a.workoutName}</p>
                    </div>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    <Badge variant={isCompleted ? "green" : a.status === 'in_progress' ? "amber" : "stone"}>
                      {a.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
