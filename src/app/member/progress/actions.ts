"use server";

import { getSession } from "@/lib/auth/getSession";
import { addWeightEntry } from "@/lib/db/queries/progress";
import { revalidatePath } from "next/cache";

export async function addWeightAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "member") {
    throw new Error("Unauthorized");
  }

  const weightStr = formData.get("weight") as string;
  const weight = parseFloat(weightStr);
  
  if (isNaN(weight) || weight < 20 || weight > 500) {
    throw new Error("Invalid weight");
  }

  const notes = (formData.get("notes") as string)?.trim() || null;

  await addWeightEntry(session.userId, weight, notes);
  revalidatePath("/member/progress");
}
