import { getSession } from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import { getMemberProfile } from "@/lib/db/queries/member";
import { getTodayWorkout } from "@/lib/db/queries/workout";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default async function MemberDashboard() {
  const session = await getSession();
  if (!session || session.role !== "member") redirect("/login");

  const [profile, workout] = await Promise.all([
    getMemberProfile(session.userId),
    getTodayWorkout(session.userId)
  ]);

  if (!profile) redirect("/login");

  const isWorkoutDone = workout?.status === 'completed';
  const isWorkoutInProgress = workout?.status === 'in_progress';
  const completedExercises = workout?.exercises.filter(e => e.sets.every(s => s.completed)).length || 0;
  const totalExercises = workout?.exercises.length || 0;

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, {profile.name}</h1>
        <p className="text-stone-400 mt-1">Ready to crush your goals today?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Workout Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest">Today&apos;s Workout</h2>
            {workout && <span className="text-xs font-medium bg-stone-800 text-stone-300 px-2 py-1 rounded-full">{workout.status.replace('_', ' ')}</span>}
          </div>

          {!profile.goal || !profile.experience || !profile.trainingFrequency ? (
            <div className="text-center py-6">
              <p className="text-white font-medium mb-1">Complete your training profile</p>
              <p className="text-sm text-stone-400 mb-6">We need a few details to generate your personalized workouts.</p>
              <Link 
                href="/member/profile" 
                className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-medium px-6 py-2.5 rounded-full transition-colors"
              >
                Setup Profile
              </Link>
            </div>
          ) : !workout ? (
            <div className="text-center py-6">
              <p className="text-white font-medium mb-1">No workout generated yet</p>
              <p className="text-sm text-stone-400 mb-6">Start your day by generating your personalized workout.</p>
              <Link 
                href="/member/workout" 
                className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-medium px-6 py-2.5 rounded-full transition-colors"
              >
                Start Today&apos;s Workout
              </Link>
            </div>
          ) : isWorkoutDone ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-white font-medium mb-1">{workout.name} Completed</p>
              <p className="text-sm text-stone-400 mb-6">Great job today! View your history for details.</p>
              <Link 
                href="/member/workout/history" 
                className="inline-block bg-stone-800 hover:bg-stone-700 text-white font-medium px-6 py-2.5 rounded-full transition-colors"
              >
                View History
              </Link>
            </div>
          ) : (
            <div className="py-2">
              <h3 className="text-xl font-bold text-white mb-2">{workout.name}</h3>
              <p className="text-sm text-stone-400 mb-6">
                {totalExercises} exercises {isWorkoutInProgress ? `· ${completedExercises}/${totalExercises} completed` : ''}
              </p>
              
              <Link 
                href="/member/workout" 
                className="block w-full text-center bg-amber-600 hover:bg-amber-500 text-white font-medium px-6 py-3.5 rounded-xl transition-colors"
              >
                {isWorkoutInProgress ? "Continue Workout" : "Start Workout"}
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <div className="space-y-4">
          <Link href="/member/exercises" className="block">
            <Card className="hover:border-amber-600/50 transition-colors group h-full">
              <h3 className="text-base font-semibold text-white group-hover:text-amber-500 transition-colors flex items-center justify-between">
                Explore Exercises
                <svg className="w-5 h-5 text-stone-600 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </h3>
              <p className="text-sm text-stone-400 mt-2">Browse the global library to perfect your form and discover new movements.</p>
            </Card>
          </Link>
          
          <Link href="/member/profile" className="block">
            <Card className="hover:border-stone-600 transition-colors group h-full">
              <h3 className="text-base font-semibold text-white transition-colors flex items-center justify-between">
                Fitness Profile
                <svg className="w-5 h-5 text-stone-600 group-hover:text-stone-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </h3>
              <p className="text-sm text-stone-400 mt-2">Update your goals, weight, and experience level to adjust future workouts.</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
