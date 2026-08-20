"use client";

import { useActionState, startTransition } from "react";
import { saveExerciseAction, deleteExerciseAction } from "./actions";
import { FormField } from "@/components/ui/FormField";
import { Card } from "@/components/ui/Card";

interface ExerciseFormClientProps {
  exerciseId?: string;
  initialData?: {
    name: string;
    category: string;
    primaryMuscle: string;
    secondaryMuscles: string | null;
    equipment: string | null;
    difficulty: string | null;
    instructions: string | null;
    commonMistakes: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
  };
  categories: { name: string }[];
}

export function ExerciseFormClient({ exerciseId = null, initialData, categories }: any) {
  const boundSave = saveExerciseAction.bind(null, exerciseId);
  const [state, formAction, isPending] = useActionState(boundSave, null);

  const errors = state?.errors ?? {};

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this exercise? This action cannot be undone.")) return;
    startTransition(async () => {
      await deleteExerciseAction(exerciseId);
    });
  }

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}
      {state && !state.error && !state.errors && exerciseId && (
        <div className="mb-5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
          <p className="text-sm text-emerald-400">Exercise saved successfully.</p>
        </div>
      )}

      <Card>
        <div className="space-y-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Basic Details</p>
          <FormField label="Exercise Name" name="name" required defaultValue={initialData?.name} error={errors.name} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Category" name="category" required defaultValue={initialData?.category || ""} error={errors.category}>
              <option value="">Select a category</option>
              {categories.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </FormField>
            
            <FormField label="Primary Muscle" name="primaryMuscle" required defaultValue={initialData?.primaryMuscle} error={errors.primaryMuscle} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Secondary Muscles" name="secondaryMuscles" placeholder="e.g. Triceps, Front Delts" defaultValue={initialData?.secondaryMuscles ?? ""} />
            <FormField label="Equipment" name="equipment" placeholder="e.g. Barbell, Dumbbells" defaultValue={initialData?.equipment ?? ""} />
          </div>
          
          <FormField label="Difficulty" name="difficulty" defaultValue={initialData?.difficulty || ""}>
            <option value="">Not specified</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </FormField>
        </div>
      </Card>

      <div className="mt-4">
        <Card>
          <div className="space-y-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Media (Optional for now)</p>
            <FormField label="Video URL" name="videoUrl" type="url" placeholder="https://..." defaultValue={initialData?.videoUrl ?? ""} hint="URL to exercise video (future R2 support)" />
            <FormField label="Thumbnail URL" name="thumbnailUrl" type="url" placeholder="https://..." defaultValue={initialData?.thumbnailUrl ?? ""} hint="URL to exercise image thumbnail" />
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <div className="space-y-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Execution</p>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest">Instructions</label>
              <textarea 
                name="instructions" 
                rows={4} 
                defaultValue={initialData?.instructions ?? ""}
                placeholder="Step by step execution..."
                className="w-full bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-600 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest">Common Mistakes</label>
              <textarea 
                name="commonMistakes" 
                rows={3} 
                defaultValue={initialData?.commonMistakes ?? ""}
                placeholder="What to avoid..."
                className="w-full bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-600 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-md transition-colors"
        >
          {isPending ? "Saving..." : "Save Exercise"}
        </button>
        {exerciseId && (
          <button
            type="button"
            onClick={handleDelete}
            className="sm:w-auto w-full bg-stone-900 hover:bg-red-500/10 border border-stone-800 text-red-400 font-medium text-sm py-3 px-6 rounded-md transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
