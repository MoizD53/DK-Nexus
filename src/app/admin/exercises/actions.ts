"use server";

import { getSession } from "@/lib/auth/getSession";
import { 
  addCategory, 
  renameCategory, 
  deleteCategory as dbDeleteCategory, 
  createExercise, 
  updateExercise, 
  deleteExercise as dbDeleteExercise 
} from "@/lib/db/queries/exercises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Categories ──────────────────────────────────────────────────────────────

export async function createCategoryAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name || name.trim().length < 2) return { error: "Category name must be at least 2 characters" };

  try {
    await addCategory(name);
  } catch (err: any) {
    return { error: err.message || "Failed to create category" };
  }

  revalidatePath("/admin/exercises/categories");
  return { success: true };
}

export async function updateCategoryAction(id: string, prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name || name.trim().length < 2) return { error: "Category name must be at least 2 characters" };

  try {
    await renameCategory(id, name);
  } catch (err: any) {
    return { error: err.message || "Failed to update category" };
  }

  revalidatePath("/admin/exercises/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") throw new Error("Unauthorized");

  await dbDeleteCategory(id);
  revalidatePath("/admin/exercises/categories");
}

// ─── Exercises ───────────────────────────────────────────────────────────────

type ExFormState = { error?: string; errors?: Record<string, string> } | null;

export async function saveExerciseAction(
  id: string | null,
  prevState: ExFormState,
  formData: FormData
): Promise<ExFormState> {
  const session = await getSession();
  if (!session || session.role !== "master_admin") return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const primaryMuscle = (formData.get("primaryMuscle") as string)?.trim();
  const secondaryMuscles = (formData.get("secondaryMuscles") as string)?.trim() || null;
  const equipment = (formData.get("equipment") as string)?.trim() || null;
  const difficulty = (formData.get("difficulty") as string)?.trim() || null;
  const instructions = (formData.get("instructions") as string)?.trim() || null;
  const commonMistakes = (formData.get("commonMistakes") as string)?.trim() || null;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string)?.trim() || null;

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required";
  if (!category) errors.category = "Category is required";
  if (!primaryMuscle) errors.primaryMuscle = "Primary muscle is required";

  if (Object.keys(errors).length > 0) return { errors };

  const data = {
    name, category, primaryMuscle, secondaryMuscles, equipment, 
    difficulty, instructions, commonMistakes, videoUrl, thumbnailUrl
  };

  try {
    if (id) {
      await updateExercise(id, data);
    } else {
      await createExercise(data);
    }
  } catch (err: any) {
    console.error("saveExerciseAction error:", err);
    return { error: "Something went wrong saving the exercise." };
  }

  revalidatePath("/admin/exercises");
  if (id) {
    revalidatePath(`/admin/exercises/${id}`);
    return { error: "" }; // signals success to client to stay on page
  }
  redirect("/admin/exercises");
}

export async function deleteExerciseAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "master_admin") throw new Error("Unauthorized");

  await dbDeleteExercise(id);
  revalidatePath("/admin/exercises");
  redirect("/admin/exercises");
}
