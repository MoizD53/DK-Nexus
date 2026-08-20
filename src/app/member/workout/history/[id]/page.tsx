import { getSession } from "@/lib/auth/getSession";
import { redirect, notFound } from "next/navigation";
import { getWorkoutDetails } from "@/lib/db/queries/workout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");

  const { id } = await params;
  const workout = await getWorkoutDetails(session.userId, id);

  if (!workout) notFound();

  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });

  const durationStr = workout.completedAt 
    ? Math.max(1, Math.round((new Date(workout.completedAt).getTime() - new Date(workout.date).getTime()) / 60000)) + ' min'
    : 'Unknown';

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto pb-12">
      <div className="mb-7 flex items-center gap-3">
        <Link
          href="/member/workout/history"
          className="text-stone-500 hover:text-stone-300 transition-colors shrink-0"
          aria-label="Back to History"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white truncate">{workout.name}</h1>
            <Badge variant="green">{workout.status}</Badge>
          </div>
          <p className="text-sm text-stone-400 mt-0.5">{formattedDate} · Duration: {durationStr}</p>
        </div>
      </div>

      <div className="space-y-6">
        {workout.exercises.map((ex, idx) => {
          const completedSets = ex.sets.filter(s => s.completed).length;
          
          return (
            <Card key={ex.id} padding={false} className="overflow-hidden">
              <div className="p-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {idx + 1}. {ex.name}
                  </h3>
                  <p className="text-sm text-stone-400 mt-0.5">{ex.primaryMuscle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-stone-300">
                    {completedSets} / {ex.sets.length} sets
                  </p>
                </div>
              </div>
              <div className="divide-y divide-stone-800/50 bg-stone-900/50">
                {ex.sets.map((set, sIdx) => (
                  <div key={set.id} className="p-3 px-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xs font-bold text-stone-500 w-4">{sIdx + 1}</span>
                      <div className="grid grid-cols-2 gap-4 flex-1 max-w-xs text-sm">
                        <div className="text-stone-300">
                          <span className="text-stone-500 mr-2">kg</span>
                          {set.weight ?? '-'}
                        </div>
                        <div className="text-stone-300">
                          <span className="text-stone-500 mr-2">reps</span>
                          {set.repsCompleted ?? '-'} 
                          <span className="text-stone-600 text-xs ml-1">/ {set.targetReps}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {set.completed ? (
                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
