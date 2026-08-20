"use client";

import { useActionState, startTransition } from "react";
import { updateMemberAction, toggleMemberStatusAction } from "../actions";
import { FormField } from "@/components/ui/FormField";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface GymMember {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  experience: string | null;
  trainingFrequency: number | null;
  status: string;
  createdAt: string;
}

type FormState = { error?: string; errors?: Record<string, string> } | null;

export function MemberDetailClient({ member }: { member: GymMember }) {
  const boundUpdate = updateMemberAction.bind(null, member.memberId);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    boundUpdate,
    null
  );

  const errors = state?.errors ?? {};
  const isActive = member.status === "active";

  function handleToggleStatus() {
    if (!confirm(`Are you sure you want to ${isActive ? "deactivate" : "activate"} this member?`)) return;
    startTransition(async () => {
      await toggleMemberStatusAction(member.memberId, isActive ? "inactive" : "active");
    });
  }

  return (
    <div className="space-y-4">
      {/* Status card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Status</p>
            <Badge variant={isActive ? "green" : "stone"}>{member.status}</Badge>
          </div>
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`text-sm font-medium px-4 py-2 rounded-md border transition-colors ${
              isActive
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </Card>

      {/* Edit form */}
      <form action={formAction}>
        {state?.error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}
        {state && !state.error && !state.errors && (
          <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <p className="text-sm text-emerald-400">Member updated successfully.</p>
          </div>
        )}

        <Card>
          <div className="space-y-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Account Details</p>
            <FormField label="Full Name" name="name" required defaultValue={member.name} error={errors.name} />
            <FormField label="Email" name="email" type="email" required defaultValue={member.email} error={errors.email} />
          </div>
        </Card>

        <div className="mt-4">
          <Card>
            <div className="space-y-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Fitness Profile</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Age" name="age" type="number" defaultValue={member.age ?? ""} min={13} max={100} error={errors.age} />
                <FormField label="Height (cm)" name="height" type="number" defaultValue={member.height ?? ""} min={50} max={300} error={errors.height} />
                <FormField label="Weight (kg)" name="weight" type="number" defaultValue={member.weight ?? ""} min={20} max={500} error={errors.weight} />
              </div>
              <FormField label="Goal" name="goal" defaultValue={member.goal ?? ""} error={errors.goal}>
                <option value="">No goal set</option>
                <option value="Build Muscle">Build Muscle</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Strength">Strength</option>
                <option value="General Fitness">General Fitness</option>
              </FormField>
              <FormField label="Experience Level" name="experience" defaultValue={member.experience ?? ""} error={errors.experience}>
                <option value="">Not specified</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </FormField>
              <div>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Training Frequency</p>
                <p className="text-sm text-stone-300 bg-stone-900 border border-stone-800 px-3 py-2.5 rounded-md">
                  {member.trainingFrequency ? `${member.trainingFrequency} Days / Week` : "Not set"}
                </p>
                <p className="text-xs text-stone-500 mt-1">Set by member during profile completion.</p>
              </div>
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
