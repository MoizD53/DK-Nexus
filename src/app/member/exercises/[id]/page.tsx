import { getSession } from "@/lib/auth/getSession";
import { redirect, notFound } from "next/navigation";
import { getExercise } from "@/lib/db/queries/exercises";
import { getExercisePerformance } from "@/lib/db/queries/progress";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { StatCard } from "@/components/ui/StatCard";

export default async function MemberExerciseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");

  const { id } = await params;
  
  const [exercise, performance] = await Promise.all([
    getExercise(id),
    getExercisePerformance(session.userId, id)
  ]);
  
  if (!exercise) notFound();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Media Header Area */}
      <div className="w-full relative">
        <VideoPlayer 
          videoUrl={exercise.videoUrl} 
          thumbnailUrl={exercise.thumbnailUrl} 
          title={exercise.name} 
        />
        
        <Link
          href="/member/exercises"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 bg-stone-950/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-stone-900 border border-white/10 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      <div className="px-5 py-6 lg:px-8 lg:py-8">
        {/* Title & Badges */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="stone">{exercise.category}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{exercise.name}</h1>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Target Muscles</p>
            <p className="text-sm font-medium text-stone-200">{exercise.primaryMuscle}</p>
            {exercise.secondaryMuscles && (
              <p className="text-xs text-stone-500 mt-1">{exercise.secondaryMuscles}</p>
            )}
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Equipment</p>
            <p className="text-sm font-medium text-stone-200">{exercise.equipment || "Bodyweight"}</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 col-span-2 lg:col-span-2 flex flex-col justify-center items-start pl-6">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Personal Best</p>
            <p className="text-2xl font-bold text-amber-500">
              {performance.personalBest ? `${performance.personalBest} kg` : "--"}
            </p>
          </div>
        </div>

        {/* Performance History */}
        {performance.history.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">Performance History</h3>
            <Card padding={false}>
              <div className="divide-y divide-stone-800">
                {performance.history.map((h, i) => {
                  const dateObj = new Date(h.workoutDate);
                  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-stone-800/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-stone-200">{formattedDate}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{h.workoutName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-500">{h.bestWeight ? `${h.bestWeight} kg` : "Bodyweight"}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{h.sets} sets · {h.totalReps} total reps</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-6">
          {exercise.instructions && (
            <Card>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                HOW TO PERFORM
              </h3>
              <div className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                {exercise.instructions}
              </div>
            </Card>
          )}

          {exercise.commonMistakes && (
            <Card>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                COMMON MISTAKES
              </h3>
              <div className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                {exercise.commonMistakes}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
