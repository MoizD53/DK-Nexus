"use client";

import { useActionState } from "react";
import { createMemberAction } from "../actions";
import { FormField } from "@/components/ui/FormField";
import { Card } from "@/components/ui/Card";

type FormState = { error?: string; errors?: Record<string, string> } | null;

export function NewMemberForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    createMemberAction,
    null
  );

  const errors = state?.errors ?? {};

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      <Card>
        <div className="space-y-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Account</p>
          <FormField label="Full Name" name="name" required placeholder="e.g. Arjun Sharma" error={errors.name} />
          <FormField label="Email" name="email" type="email" required placeholder="member@email.com" autoComplete="off" error={errors.email} />
          <FormField label="Password" name="password" type="password" required placeholder="Min. 6 characters" autoComplete="new-password" error={errors.password} />
        </div>
      </Card>

      <div className="mt-4">
        <Card>
          <div className="space-y-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Fitness Profile</p>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Age" name="age" type="number" placeholder="25" min={13} max={100} error={errors.age} />
              <FormField label="Height (cm)" name="height" type="number" placeholder="175" min={50} max={300} error={errors.height} />
              <FormField label="Weight (kg)" name="weight" type="number" placeholder="70" min={20} max={500} error={errors.weight} />
            </div>
            <FormField label="Goal" name="goal" error={errors.goal}>
              <option value="">No goal set</option>
              <option value="Build Muscle">Build Muscle</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Strength">Strength</option>
              <option value="General Fitness">General Fitness</option>
            </FormField>
            <FormField label="Experience Level" name="experience" error={errors.experience}>
              <option value="">Not specified</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </FormField>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-md transition-colors"
        >
          {isPending ? "Creating..." : "Create Member"}
        </button>
      </div>
    </form>
  );
}
