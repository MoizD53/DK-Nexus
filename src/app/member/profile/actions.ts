"use server";

import { getSession } from "@/lib/auth/getSession";
import { getMemberProfile, updateMemberProfile } from "@/lib/db/queries/member";
import { revalidatePath } from "next/cache";

const VALID_GOALS = ["Build Muscle", "Weight Loss", "Strength", "General Fitness"];
const VALID_EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];

type FormState = { error?: string; errors?: Record<string, string>; success?: boolean } | null;

function parseOptionalNumber(val: string, label: string, min: number, max: number): { value: number | null; error?: string } {
  if (!val?.trim()) return { value: null };
  const n = Number(val);
  if (isNaN(n) || n < min || n > max) return { value: null, error: `${label} must be between ${min} and ${max}` };
  return { value: n };
}

export async function updateProfileAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Verify session — userId is ALWAYS from server session
  const session = await getSession();
  if (!session || session.role !== "member") return { error: "Unauthorized" };

  // 2. Verify the member actually exists (safety check)
  const profile = await getMemberProfile(session.userId);
  if (!profile) return { error: "Profile not found" };

  // 3. Read and validate form data
  const name = (formData.get("name") as string)?.trim();
  const ageStr = formData.get("age") as string;
  const heightStr = formData.get("height") as string;
  const weightStr = formData.get("weight") as string;
  const goal = (formData.get("goal") as string)?.trim() || null;
  const experience = (formData.get("experience") as string)?.trim() || null;
  const freqStr = formData.get("trainingFrequency") as string;

  const errors: Record<string, string> = {};

  if (!name || name.length < 2) errors.name = "Name must be at least 2 characters";

  const ageResult = parseOptionalNumber(ageStr, "Age", 13, 100);
  const heightResult = parseOptionalNumber(heightStr, "Height", 50, 300);
  const weightResult = parseOptionalNumber(weightStr, "Weight", 20, 500);
  const freqResult = parseOptionalNumber(freqStr, "Training frequency", 2, 7);

  if (ageResult.error) errors.age = ageResult.error;
  if (heightResult.error) errors.height = heightResult.error;
  if (weightResult.error) errors.weight = weightResult.error;
  if (freqResult.error) errors.trainingFrequency = freqResult.error;
  if (goal && !VALID_GOALS.includes(goal)) errors.goal = "Select a valid goal";
  if (experience && !VALID_EXPERIENCE.includes(experience)) errors.experience = "Select a valid experience level";

  if (Object.keys(errors).length > 0) return { errors };

  // 4. Update — userId is from session, never from form data
  try {
    await updateMemberProfile(session.userId, {
      name,
      age: ageResult.value,
      height: heightResult.value,
      weight: weightResult.value,
      goal,
      experience,
      trainingFrequency: freqResult.value
    });
  } catch (err) {
    console.error("updateProfileAction error:", err);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/member/profile");
  return { success: true };
}
