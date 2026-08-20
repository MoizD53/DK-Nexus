import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getOwnerWorkoutActivity } from "@/lib/db/queries/workout";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default async function OwnerWorkoutsPage() {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  const activity = await getOwnerWorkoutActivity(session.userId);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-4xl">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Member Workouts</h1>
        <p className="text-sm text-stone-400 mt-1">Recent workout activity from members in your gym</p>
      </div>

      <Card padding={false}>
        {activity.length === 0 ? (
          <EmptyState 
            title="No recent workouts" 
            description="When your members complete or start workouts, they will appear here." 
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {activity.map(a => {
              const dateObj = new Date(a.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              const isCompleted = a.status === 'completed';
              
              return (
                <div key={a.id} className="p-5 flex items-center justify-between group hover:bg-stone-800/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div className="min-w-32">
                      <p className="text-sm font-semibold text-stone-200">{a.memberName}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{a.name}</p>
                    </div>
                  </div>
                  <div className="shrink-0 mt-2 sm:mt-0">
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
