"use server";

import { getSession } from "@/lib/auth/getSession";
import { getOwnerGymId, createMember, updateGymMember, toggleMemberStatus } from "@/lib/db/queries/owner";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const VALID_GOALS = ["Build Muscle", "Weight Loss", "Strength", "General Fitness"];
const VALID_EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];

type FormState = { error?: string; errors?: Record<string, string> } | null;

// ─── Validation helpers ────────────────────────────────────────────────────────
function validateEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : "Enter a valid email address";
}
function parseOptionalNumber(val: string, label: string, min: number, max: number): { value: number | null; error?: string } {
  if (!val.trim()) return { value: null };
  const n = Number(val);
  if (isNaN(n) || n < min || n > max) return { value: null, error: `${label} must be between ${min} and ${max}` };
  return { value: n };
}

// ─── Create member ─────────────────────────────────────────────────────────────
export async function createMemberAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== "owner") return { error: "Unauthorized" };

  const gymId = await getOwnerGymId(session.userId);
  if (!gymId) return { error: "Gym not found for this owner" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const ageStr = formData.get("age") as string;
  const heightStr = formData.get("height") as string;
  const weightStr = formData.get("weight") as string;
  const goal = (formData.get("goal") as string)?.trim() || null;
  const experience = (formData.get("experience") as string)?.trim() || null;

  const errors: Record<string, string> = {};

  if (!name || name.length < 2) errors.name = "Name must be at least 2 characters";
  if (!email) errors.email = "Email is required";
  else if (validateEmail(email)) errors.email = validateEmail(email)!;
  if (!password || password.length < 6) errors.password = "Password must be at least 6 characters";

  const ageResult = parseOptionalNumber(ageStr, "Age", 13, 100);
  const heightResult = parseOptionalNumber(heightStr, "Height", 50, 300);
  const weightResult = parseOptionalNumber(weightStr, "Weight", 20, 500);

  if (ageResult.error) errors.age = ageResult.error;
  if (heightResult.error) errors.height = heightResult.error;
  if (weightResult.error) errors.weight = weightResult.error;
  if (goal && !VALID_GOALS.includes(goal)) errors.goal = "Select a valid goal";
  if (experience && !VALID_EXPERIENCE.includes(experience)) errors.experience = "Select a valid experience level";

  if (Object.keys(errors).length > 0) return { errors };

  try {
    await createMember(gymId, {
      name,
      email,
      password,
      age: ageResult.value,
      height: heightResult.value,
      weight: weightResult.value,
      goal,
      experience,
    });
  } catch (err: any) {
    if (err?.message === "EMAIL_TAKEN") return { errors: { email: "This email is already registered" } };
    console.error("createMemberAction error:", err);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/owner/members");
  redirect("/owner/members");
}

// ─── Update member ─────────────────────────────────────────────────────────────
export async function updateMemberAction(
  memberId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== "owner") return { error: "Unauthorized" };

  const gymId = await getOwnerGymId(session.userId);
  if (!gymId) return { error: "Gym not found" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const ageStr = formData.get("age") as string;
  const heightStr = formData.get("height") as string;
  const weightStr = formData.get("weight") as string;
  const goal = (formData.get("goal") as string)?.trim() || null;
  const experience = (formData.get("experience") as string)?.trim() || null;

  const errors: Record<string, string> = {};

  if (!name || name.length < 2) errors.name = "Name must be at least 2 characters";
  if (!email) errors.email = "Email is required";
  else if (validateEmail(email)) errors.email = validateEmail(email)!;

  const ageResult = parseOptionalNumber(ageStr, "Age", 13, 100);
  const heightResult = parseOptionalNumber(heightStr, "Height", 50, 300);
  const weightResult = parseOptionalNumber(weightStr, "Weight", 20, 500);

  if (ageResult.error) errors.age = ageResult.error;
  if (heightResult.error) errors.height = heightResult.error;
  if (weightResult.error) errors.weight = weightResult.error;
  if (goal && !VALID_GOALS.includes(goal)) errors.goal = "Select a valid goal";
  if (experience && !VALID_EXPERIENCE.includes(experience)) errors.experience = "Select a valid experience level";

  if (Object.keys(errors).length > 0) return { errors };

  try {
    await updateGymMember(memberId, gymId, {
      name,
      email,
      age: ageResult.value,
      height: heightResult.value,
      weight: weightResult.value,
      goal,
      experience,
    });
  } catch (err: any) {
    if (err?.message === "EMAIL_TAKEN") return { errors: { email: "This email is already registered" } };
    if (err?.message === "MEMBER_NOT_FOUND") return { error: "Member not found" };
    console.error("updateMemberAction error:", err);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/owner/members");
  revalidatePath(`/owner/members/${memberId}`);
  return null; // success — no redirect, stay on page to show updated data
}

// ─── Toggle member status ──────────────────────────────────────────────────────
export async function toggleMemberStatusAction(
  memberId: string,
  newStatus: "active" | "inactive"
): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "owner") throw new Error("Unauthorized");

  const gymId = await getOwnerGymId(session.userId);
  if (!gymId) throw new Error("Gym not found");

  await toggleMemberStatus(memberId, gymId, newStatus);
  revalidatePath("/owner/members");
  revalidatePath(`/owner/members/${memberId}`);
}
