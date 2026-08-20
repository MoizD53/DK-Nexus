import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getOwnerGymId, getGymProgress } from "@/lib/db/queries/owner";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";

export default async function OwnerProgress() {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  const gymId = await getOwnerGymId(session.userId);
  if (!gymId) redirect("/login");

  const progressData = await getGymProgress(gymId);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">Member Progress</h1>
        <p className="text-sm text-stone-400 mt-1">Track member fitness progress and consistency</p>
      </div>

      <Card padding={false}>
        {progressData.length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Add members to your gym to start tracking their progress."
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {progressData.map((member) => (
              <Link 
                key={member.memberId}
                href={`/owner/members/${member.memberId}`}
                className="flex items-center gap-4 p-4 hover:bg-stone-800/50 transition-colors"
              >
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-200 truncate">{member.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">
                    {member.workoutsCompleted} Workouts • {member.completionRate}% Consistency
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-amber-500">
                    {member.currentWeight ? `${member.currentWeight} kg` : "No weight log"}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {member.lastWorkoutDate ? `Last active: ${member.lastWorkoutDate}` : "No activity yet"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
