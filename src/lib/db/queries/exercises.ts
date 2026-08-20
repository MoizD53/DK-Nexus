import { db } from "../index";
import crypto from "crypto";

export interface ExerciseCategory {
  id: string;
  name: string;
  exerciseCount: number;
}

export interface Exercise {
  id: string;
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
  status?: string;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<ExerciseCategory[]> {
  const result = await db.execute(`
    SELECT c.id, c.name, COUNT(CASE WHEN e.status = 'active' THEN e.id END) as exercise_count
    FROM exercise_categories c
    LEFT JOIN exercises e ON e.category = c.name
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
  `);
  
  return result.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    exerciseCount: Number(r.exercise_count ?? 0)
  }));
}

export async function getExercises(filters?: { 
  search?: string, 
  category?: string,
  muscle?: string,
  equipment?: string,
  difficulty?: string,
  includeDeleted?: boolean
}): Promise<Exercise[]> {
  let sql = `SELECT * FROM exercises WHERE 1=1`;
  const args: any[] = [];

  if (!filters?.includeDeleted) {
    sql += ` AND (status = 'active' OR status IS NULL)`;
  }
  
  if (filters?.search) {
    sql += ` AND name LIKE ?`;
    args.push(`%${filters.search}%`);
  }
  if (filters?.category) {
    sql += ` AND category = ?`;
    args.push(filters.category);
  }
  if (filters?.muscle) {
    sql += ` AND primary_muscle LIKE ?`;
    args.push(`%${filters.muscle}%`);
  }
  if (filters?.equipment) {
    sql += ` AND equipment LIKE ?`;
    args.push(`%${filters.equipment}%`);
  }
  if (filters?.difficulty) {
    sql += ` AND difficulty = ?`;
    args.push(filters.difficulty);
  }
  
  sql += ` ORDER BY name ASC`;
  
  const result = await db.execute({ sql, args });
  return result.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    category: (r.category as string) || "Uncategorized",
    primaryMuscle: r.primary_muscle as string,
    secondaryMuscles: r.secondary_muscles as string | null,
    equipment: r.equipment as string | null,
    difficulty: r.difficulty as string | null,
    instructions: r.instructions as string | null,
    commonMistakes: r.common_mistakes as string | null,
    videoUrl: r.video_url as string | null,
    thumbnailUrl: r.thumbnail_url as string | null,
    status: r.status as string,
  }));
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const result = await db.execute({
    sql: `SELECT * FROM exercises WHERE id = ?`,
    args: [id]
  });
  if (result.rows.length === 0) return null;
  
  const r = result.rows[0];
  return {
    id: r.id as string,
    name: r.name as string,
    category: (r.category as string) || "Uncategorized",
    primaryMuscle: r.primary_muscle as string,
    secondaryMuscles: r.secondary_muscles as string | null,
    equipment: r.equipment as string | null,
    difficulty: r.difficulty as string | null,
    instructions: r.instructions as string | null,
    commonMistakes: r.common_mistakes as string | null,
    videoUrl: r.video_url as string | null,
    thumbnailUrl: r.thumbnail_url as string | null,
    status: r.status as string,
  };
}

// ─── Admin Category CMS ───────────────────────────────────────────────────────

export async function addCategory(name: string) {
  const check = await db.execute({ sql: "SELECT id FROM exercise_categories WHERE name = ?", args: [name] });
  if (check.rows.length > 0) throw new Error("Category already exists");
  
  await db.execute({
    sql: "INSERT INTO exercise_categories (id, name) VALUES (?, ?)",
    args: [crypto.randomUUID(), name.trim()]
  });
}

export async function renameCategory(id: string, newName: string) {
  const check = await db.execute({ sql: "SELECT id FROM exercise_categories WHERE name = ? AND id != ?", args: [newName, id] });
  if (check.rows.length > 0) throw new Error("Category name already exists");
  
  const current = await db.execute({ sql: "SELECT name FROM exercise_categories WHERE id = ?", args: [id] });
  if (current.rows.length === 0) throw new Error("Category not found");
  const oldName = current.rows[0].name as string;
  
  await db.batch([
    { sql: "UPDATE exercises SET category = ? WHERE category = ?", args: [newName.trim(), oldName] },
    { sql: "UPDATE exercise_categories SET name = ? WHERE id = ?", args: [newName.trim(), id] }
  ]);
}

export async function deleteCategory(id: string) {
  const current = await db.execute({ sql: "SELECT name FROM exercise_categories WHERE id = ?", args: [id] });
  if (current.rows.length === 0) throw new Error("Category not found");
  const name = current.rows[0].name as string;
  
  const usage = await db.execute({ sql: "SELECT COUNT(*) as count FROM exercises WHERE category = ? AND (status = 'active' OR status IS NULL)", args: [name] });
  if (Number(usage.rows[0].count) > 0) {
    throw new Error("Cannot delete category currently in use by active exercises");
  }
  
  await db.execute({ sql: "DELETE FROM exercise_categories WHERE id = ?", args: [id] });
}

// ─── Admin Exercise CMS ───────────────────────────────────────────────────────

export type ExerciseInput = Omit<Exercise, "id" | "status">;

export async function createExercise(data: ExerciseInput) {
  await db.execute({
    sql: `INSERT INTO exercises (
      id, name, category, primary_muscle, secondary_muscles, equipment, 
      difficulty, instructions, common_mistakes, video_url, thumbnail_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    args: [
      crypto.randomUUID(),
      data.name,
      data.category,
      data.primaryMuscle,
      data.secondaryMuscles ?? null,
      data.equipment ?? null,
      data.difficulty ?? null,
      data.instructions ?? null,
      data.commonMistakes ?? null,
      data.videoUrl ?? null,
      data.thumbnailUrl ?? null
    ]
  });
}

export async function updateExercise(id: string, data: ExerciseInput) {
  await db.execute({
    sql: `UPDATE exercises SET 
      name = ?, category = ?, primary_muscle = ?, secondary_muscles = ?, 
      equipment = ?, difficulty = ?, instructions = ?, common_mistakes = ?, 
      video_url = ?, thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    args: [
      data.name,
      data.category,
      data.primaryMuscle,
      data.secondaryMuscles ?? null,
      data.equipment ?? null,
      data.difficulty ?? null,
      data.instructions ?? null,
      data.commonMistakes ?? null,
      data.videoUrl ?? null,
      data.thumbnailUrl ?? null,
      id
    ]
  });
}

export async function deleteExercise(id: string) {
  // Soft delete to prevent breaking historical workout sets
  await db.execute({ sql: "UPDATE exercises SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?", args: [id] });
}
