"use server";

import { getSession } from "@/lib/auth/getSession";
import { generateWorkout, updateWorkoutSet, updateWorkoutStatus } from "@/lib/db/queries/workout";
import { revalidatePath } from "next/cache";

export async function generateTodayWorkoutAction() {
  const session = await getSession();
  if (!session || session.role !== "member") throw new Error("Unauthorized");
  
  await generateWorkout(session.userId);
  revalidatePath("/member/workout");
  revalidatePath("/member");
}

export async function startWorkoutAction(workoutId: string) {
  const session = await getSession();
  if (!session || session.role !== "member") throw new Error("Unauthorized");
  
  await updateWorkoutStatus(session.userId, workoutId, "in_progress");
  revalidatePath("/member/workout");
}

export async function saveSetAction(setId: string, weight: number, reps: number) {
  const session = await getSession();
  if (!session || session.role !== "member") throw new Error("Unauthorized");
  
  await updateWorkoutSet(session.userId, setId, weight, reps, true);
  // Revalidate so page updates if needed, though client will optimistically update
  revalidatePath("/member/workout");
}

export async function finishWorkoutAction(workoutId: string) {
  const session = await getSession();
  if (!session || session.role !== "member") throw new Error("Unauthorized");
  
  await updateWorkoutStatus(session.userId, workoutId, "completed");
  revalidatePath("/member/workout");
  revalidatePath("/member");
  revalidatePath("/member/workout/history");
}
