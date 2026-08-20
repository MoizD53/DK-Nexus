"use client";

import { useActionState } from "react";
import { updateProfileAction } from "./actions";
import { FormField } from "@/components/ui/FormField";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface MemberProfile {
  id: string;
  memberId: string;
  name: string;
  email: string;
  gymId: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  experience: string | null;
  trainingFrequency: number | null;
}

type FormState = { error?: string; errors?: Record<string, string>; success?: boolean } | null;

export function ProfileClient({ profile }: { profile: MemberProfile }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    updateProfileAction,
    null
  );

  const errors = state?.errors ?? {};

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} size="lg" />
          <div className="min-w-0">
            <p className="text-base font-semibold text-white truncate">{profile.name}</p>
            <p className="text-sm text-stone-400 truncate">{profile.email}</p>
            <div className="mt-2">
              <Badge variant="green">Active</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <form action={formAction}>
        {state?.error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}
        {state?.success && (
          <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <p className="text-sm text-emerald-400">Profile updated successfully.</p>
          </div>
        )}

        <Card>
          <div className="space-y-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Personal Details</p>
            <FormField
              label="Full Name"
              name="name"
              required
              defaultValue={profile.name}
              error={errors.name}
            />
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Email</p>
              <p className="text-sm text-stone-500 px-4 py-3 bg-stone-800 rounded-md">{profile.email}</p>
              <p className="text-xs text-stone-600 mt-1">Contact your gym to change your email.</p>
            </div>
          </div>
        </Card>

        <div className="mt-4">
          <Card>
            <div className="space-y-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Training Profile</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="Age"
                  name="age"
                  type="number"
                  defaultValue={profile.age ?? ""}
                  min={13}
                  max={100}
                  error={errors.age}
                />
                <FormField
                  label="Height (cm)"
                  name="height"
                  type="number"
                  defaultValue={profile.height ?? ""}
                  min={50}
                  max={300}
                  error={errors.height}
                />
                <FormField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  defaultValue={profile.weight ?? ""}
                  min={20}
                  max={500}
                  error={errors.weight}
                />
              </div>
              <FormField label="Goal" name="goal" defaultValue={profile.goal ?? ""} error={errors.goal}>
                <option value="">No goal set</option>
                <option value="Build Muscle">Build Muscle</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Strength">Strength</option>
                <option value="General Fitness">General Fitness</option>
              </FormField>
              <FormField label="Experience Level" name="experience" defaultValue={profile.experience ?? ""} error={errors.experience}>
                <option value="">Not specified</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </FormField>
              <FormField label="Training Frequency (Days/Week)" name="trainingFrequency" type="number" defaultValue={profile.trainingFrequency ?? ""} min={2} max={7} error={errors.trainingFrequency} />
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-md transition-colors"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
