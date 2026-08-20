import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getMemberProgress } from "@/lib/db/queries/progress";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WeightForm } from "./WeightForm";
import { WeightChart } from "./WeightChart";

export default async function MemberProgress() {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");

  const data = await getMemberProgress(session.userId);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Progress</h1>
        <p className="text-sm text-stone-400 mt-1">Track your consistency and performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Current Weight" 
          value={data.stats.currentWeight ? `${data.stats.currentWeight} kg` : "--"}
          sublabel={data.stats.weightChange ? `${data.stats.weightChange > 0 ? '+' : ''}${data.stats.weightChange} kg from start` : undefined}
        />
        <StatCard 
          label="Total Workouts" 
          value={data.stats.completedWorkouts}
          sublabel="All time"
        />
        <StatCard 
          label="Current Streak" 
          value={data.stats.currentStreak}
          sublabel={`Best: ${data.stats.longestStreak}`}
        />
        <StatCard 
          label="Consistency" 
          value={`${data.stats.completionRate}%`}
          sublabel={`${data.stats.workoutsThisMonth} this month`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weight Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Weight Trend</h2>
            </div>
            <WeightChart history={data.history} />
          </Card>
          
          <WeightForm />
        </div>

        {/* PRs Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <h2 className="text-base font-semibold text-white mb-5">Personal Bests</h2>
            {data.prs.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-8">Complete workouts to establish personal records.</p>
            ) : (
              <div className="space-y-4">
                {data.prs.map((pr, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-stone-800 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-stone-300">{pr.exerciseName}</span>
                    <span className="text-sm font-bold text-amber-500">{pr.maxWeight} kg</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
