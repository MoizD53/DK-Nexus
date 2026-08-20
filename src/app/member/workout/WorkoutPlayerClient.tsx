"use client";

import { useState, startTransition } from "react";
import { generateTodayWorkoutAction, startWorkoutAction, saveSetAction, finishWorkoutAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/lib/db/queries/workout";

export function WorkoutPlayerClient({ workout, profileComplete }: { workout: Workout | null, profileComplete: boolean }) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  if (!profileComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Profile Incomplete</h2>
        <p className="text-sm text-stone-400 max-w-sm mb-8">
          Please complete your training profile to generate a personalized workout.
        </p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No workout generated for today</h2>
        <p className="text-sm text-stone-400 max-w-sm mb-8">
          Generate your personalized daily workout based on your fitness goal and profile.
        </p>
        <button
          onClick={() => {
            setIsGenerating(true);
            startTransition(() => { generateTodayWorkoutAction(); });
          }}
          disabled={isGenerating}
          className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 text-white font-medium px-8 py-3.5 rounded-full transition-colors w-full sm:w-auto"
        >
          {isGenerating ? "Generating..." : "Generate Today's Workout"}
        </button>
      </div>
    );
  }

  if (workout.status === "planned") {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Today&apos;s Workout</h1>
          <h2 className="text-2xl font-bold text-white">{workout.name}</h2>
          <p className="text-sm text-stone-400 mt-2">{workout.exercises.length} exercises</p>
        </div>

        {workout.explanation && (
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 mb-6 text-center">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1">Why today</p>
            <p className="text-sm text-stone-300">{workout.explanation}</p>
          </div>
        )}

        <div className="space-y-3">
          {workout.exercises.map((ex, i) => (
            <Card key={ex.id} padding={false} className="p-4">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-200 truncate">{ex.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {ex.targetSets} sets × {ex.targetReps} reps · {ex.restSeconds}s rest
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <button
          onClick={() => startTransition(() => { startWorkoutAction(workout.id); })}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg shadow-amber-600/20"
        >
          START WORKOUT
        </button>
      </div>
    );
  }

  if (workout.status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Workout Complete!</h1>
        <p className="text-sm text-stone-400 max-w-sm mb-8">
          Great job. You finished {workout.name}. Rest up and come back tomorrow!
        </p>
      </div>
    );
  }

  // Active Player state
  return <ActivePlayer workout={workout} />;
}

// ─── Active Player Component ───────────────────────────────────────────────────

function ActivePlayer({ workout }: { workout: Workout }) {
  // Find first incomplete exercise
  const initialIndex = workout.exercises.findIndex(e => e.sets.some(s => !s.completed));
  const [exIndex, setExIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isFinishing, setIsFinishing] = useState(false);

  const activeEx = workout.exercises[exIndex];
  const isLastExercise = exIndex === workout.exercises.length - 1;
  const isWorkoutDone = workout.exercises.every(e => e.sets.every(s => s.completed));

  return (
    <div className="max-w-xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
          Exercise {exIndex + 1} of {workout.exercises.length}
        </p>
        <Badge variant="stone">{activeEx.category}</Badge>
      </div>

      {/* Video Player */}
      <div className="w-full bg-stone-950 border border-stone-800 rounded-xl relative overflow-hidden mb-6 flex flex-col items-center justify-center min-h-[200px]">
        <VideoPlayer 
          videoUrl={activeEx.videoUrl} 
          thumbnailUrl={activeEx.thumbnailUrl} 
          title={activeEx.name}
        />
      </div>

      {/* Exercise Details */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{activeEx.name}</h2>
        <p className="text-sm text-stone-400">Target: {activeEx.primaryMuscle}</p>
        <p className="text-sm font-medium text-amber-500 mt-2">
          {activeEx.targetSets} sets × {activeEx.targetReps} reps
        </p>
      </div>

      {/* Sets */}
      <div className="space-y-3 mb-8">
        {activeEx.sets.map((set, idx) => (
          <SetRow key={set.id} set={set} isPreviousCompleted={idx === 0 || activeEx.sets[idx-1].completed} />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {exIndex > 0 && (
          <button
            onClick={() => setExIndex(e => e - 1)}
            className="flex-1 bg-stone-900 border border-stone-800 text-stone-200 font-medium py-3.5 rounded-xl hover:bg-stone-800 transition-colors"
          >
            Previous
          </button>
        )}
        {!isLastExercise && (
          <button
            onClick={() => setExIndex(e => e + 1)}
            className="flex-1 bg-stone-900 border border-stone-800 text-stone-200 font-medium py-3.5 rounded-xl hover:bg-stone-800 transition-colors"
          >
            Skip / Next
          </button>
        )}
        {isWorkoutDone && isLastExercise && (
          <button
            onClick={() => {
              setIsFinishing(true);
              startTransition(() => { finishWorkoutAction(workout.id); });
            }}
            disabled={isFinishing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {isFinishing ? "Saving..." : "FINISH WORKOUT"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Set Row ──────────────────────────────────────────────────────────────────

function SetRow({ set, isPreviousCompleted }: { set: WorkoutSet, isPreviousCompleted: boolean }) {
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  const [reps, setReps] = useState(set.repsCompleted?.toString() || set.targetReps.toString());
  const [isCompleted, setIsCompleted] = useState(set.completed);
  const [isSaving, setIsSaving] = useState(false);

  function handleComplete() {
    setIsSaving(true);
    // Optimistic UI
    setIsCompleted(true);
    startTransition(async () => {
      await saveSetAction(set.id, Number(weight) || 0, Number(reps) || 0);
      setIsSaving(false);
    });
  }

  const isLocked = !isCompleted && !isPreviousCompleted;

  return (
    <Card padding={false} className={`p-3 transition-opacity ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isCompleted ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'}`}>
          {set.setNumber}
        </div>
        
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-500">kg</span>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={isCompleted || isLocked}
              placeholder="0"
              className="w-full bg-stone-950 border border-stone-800 text-stone-200 rounded-md py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-amber-600 disabled:opacity-80"
            />
          </div>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-500">reps</span>
            <input 
              type="number" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              disabled={isCompleted || isLocked}
              className="w-full bg-stone-950 border border-stone-800 text-stone-200 rounded-md py-2 pl-12 pr-3 text-sm focus:outline-none focus:border-amber-600 disabled:opacity-80"
            />
          </div>
        </div>

        <button 
          onClick={handleComplete}
          disabled={isCompleted || isLocked || isSaving}
          className={`shrink-0 w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
            isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
          }`}
        >
          {isCompleted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
        </button>
      </div>
    </Card>
  );
}
