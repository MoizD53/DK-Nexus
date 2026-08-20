import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getWorkoutHistory } from "@/lib/db/queries/workout";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function WorkoutHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");

  const history = await getWorkoutHistory(session.userId);

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-2xl mx-auto">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Workout History</h1>
          <p className="text-sm text-stone-400 mt-1">Your past completed workouts</p>
        </div>
        <Link 
          href="/member/workout"
          className="text-amber-500 hover:text-amber-400 text-sm font-medium"
        >
          Today&apos;s Workout
        </Link>
      </div>

      <Card padding={false}>
        {history.length === 0 ? (
          <EmptyState 
            title="No completed workouts yet" 
            description="Start today's workout to build your history." 
          />
        ) : (
          <div className="divide-y divide-stone-800">
            {history.map(w => {
              const dateObj = new Date(w.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              return (
                <Link 
                  href={`/member/workout/history/${w.id}`}
                  key={w.id} 
                  className="p-5 flex items-center justify-between group hover:bg-stone-800/30 transition-colors block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-amber-500 transition-colors">{w.name}</h3>
                      <p className="text-sm text-stone-400">{formattedDate} · {w.exerciseCount} exercises</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="green">Completed</Badge>
                    <svg className="w-5 h-5 text-stone-600 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
