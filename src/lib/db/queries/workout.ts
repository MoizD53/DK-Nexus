import { db } from "../index";
import crypto from "crypto";
import { getMemberProfile } from "./member";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkoutSet {
  id: string;
  setNumber: number;
  targetReps: number;
  weight: number | null;
  repsCompleted: number | null;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  category: string;
  primaryMuscle: string;
  equipment: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  exerciseOrder: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  completedAt: string | null;
  explanation: string | null;
  exercises: WorkoutExercise[];
}

// ─── Fetching Workouts ───────────────────────────────────────────────────────

export async function getTodayWorkout(userId: string): Promise<Workout | null> {
  const member = await getMemberProfile(userId);
  if (!member) return null;

  // Find today's workout (using local date string matching for simplicity in SQLite)
  const today = new Date().toISOString().split('T')[0];
  
  const wRes = await db.execute({
    sql: `SELECT id, name, workout_date, status, completed_at, explanation FROM workouts 
          WHERE member_id = ? AND date(workout_date) = ? AND status != 'cancelled'
          ORDER BY created_at DESC LIMIT 1`,
    args: [member.memberId, today]
  });

  if (wRes.rows.length === 0) return null;
  const w = wRes.rows[0];

  const workout: Workout = {
    id: w.id as string,
    name: w.name as string,
    date: w.workout_date as string,
    status: w.status as any,
    completedAt: w.completed_at as string | null,
    explanation: w.explanation as string | null,
    exercises: []
  };

  // Get exercises
  const eRes = await db.execute({
    sql: `SELECT we.id, we.exercise_id, we.sets, we.reps, we.rest_seconds, we.exercise_order,
                 e.name, e.category, e.primary_muscle, e.equipment, e.video_url, e.thumbnail_url
          FROM workout_exercises we
          JOIN exercises e ON we.exercise_id = e.id
          WHERE we.workout_id = ?
          ORDER BY we.exercise_order ASC`,
    args: [workout.id]
  });

  for (const row of eRes.rows) {
    const exercise: WorkoutExercise = {
      id: row.id as string,
      exerciseId: row.exercise_id as string,
      name: row.name as string,
      category: row.category as string,
      primaryMuscle: row.primary_muscle as string,
      equipment: row.equipment as string | null,
      videoUrl: row.video_url as string | null,
      thumbnailUrl: row.thumbnail_url as string | null,
      targetSets: Number(row.sets),
      targetReps: Number(row.reps),
      restSeconds: Number(row.rest_seconds),
      exerciseOrder: Number(row.exercise_order),
      sets: []
    };
    workout.exercises.push(exercise);
  }

  // Get all sets for this workout in one query to avoid N+1
  const sRes = await db.execute({
    sql: `SELECT ws.id, ws.workout_exercise_id, ws.set_number, ws.weight, ws.reps_completed, ws.completed 
          FROM workout_sets ws
          JOIN workout_exercises we ON ws.workout_exercise_id = we.id
          WHERE we.workout_id = ? 
          ORDER BY ws.set_number ASC`,
    args: [workout.id]
  });

  const setsMap = new Map<string, WorkoutSet[]>();
  for (const s of sRes.rows) {
    const weId = s.workout_exercise_id as string;
    if (!setsMap.has(weId)) setsMap.set(weId, []);
    
    setsMap.get(weId)!.push({
      id: s.id as string,
      setNumber: Number(s.set_number),
      targetReps: 0, // Assigned below
      weight: s.weight ? Number(s.weight) : null,
      repsCompleted: s.reps_completed ? Number(s.reps_completed) : null,
      completed: Boolean(s.completed)
    });
  }

  // Attach sets to exercises
  for (const ex of workout.exercises) {
    ex.sets = setsMap.get(ex.id) || [];
    for (const set of ex.sets) {
      set.targetReps = ex.targetReps; // Now safe to attach
    }
  }

  return workout;
}

export async function getWorkoutDetails(userId: string, workoutId: string): Promise<Workout | null> {
  const member = await getMemberProfile(userId);
  if (!member) return null;

  const wRes = await db.execute({
    sql: `SELECT id, name, workout_date, status, completed_at, explanation FROM workouts 
          WHERE id = ? AND member_id = ?`,
    args: [workoutId, member.memberId]
  });

  if (wRes.rows.length === 0) return null;
  const w = wRes.rows[0];

  const workout: Workout = {
    id: w.id as string,
    name: w.name as string,
    date: w.workout_date as string,
    status: w.status as any,
    completedAt: w.completed_at as string | null,
    explanation: w.explanation as string | null,
    exercises: []
  };

  const eRes = await db.execute({
    sql: `SELECT we.id, we.exercise_id, we.sets, we.reps, we.rest_seconds, we.exercise_order,
                 e.name, e.category, e.primary_muscle, e.equipment, e.video_url, e.thumbnail_url
          FROM workout_exercises we
          JOIN exercises e ON we.exercise_id = e.id
          WHERE we.workout_id = ?
          ORDER BY we.exercise_order ASC`,
    args: [workout.id]
  });

  for (const row of eRes.rows) {
    const exercise: WorkoutExercise = {
      id: row.id as string,
      exerciseId: row.exercise_id as string,
      name: row.name as string,
      category: row.category as string,
      primaryMuscle: row.primary_muscle as string,
      equipment: row.equipment as string | null,
      videoUrl: row.video_url as string | null,
      thumbnailUrl: row.thumbnail_url as string | null,
      targetSets: Number(row.sets),
      targetReps: Number(row.reps),
      restSeconds: Number(row.rest_seconds),
      exerciseOrder: Number(row.exercise_order),
      sets: []
    };
    workout.exercises.push(exercise);
  }

  // Get all sets for this workout in one query to avoid N+1
  const sRes = await db.execute({
    sql: `SELECT ws.id, ws.workout_exercise_id, ws.set_number, ws.weight, ws.reps_completed, ws.completed 
          FROM workout_sets ws
          JOIN workout_exercises we ON ws.workout_exercise_id = we.id
          WHERE we.workout_id = ? 
          ORDER BY ws.set_number ASC`,
    args: [workout.id]
  });

  const setsMap = new Map<string, WorkoutSet[]>();
  for (const s of sRes.rows) {
    const weId = s.workout_exercise_id as string;
    if (!setsMap.has(weId)) setsMap.set(weId, []);
    
    setsMap.get(weId)!.push({
      id: s.id as string,
      setNumber: Number(s.set_number),
      targetReps: 0, // Assigned below
      weight: s.weight ? Number(s.weight) : null,
      repsCompleted: s.reps_completed ? Number(s.reps_completed) : null,
      completed: Boolean(s.completed)
    });
  }

  // Attach sets to exercises
  for (const ex of workout.exercises) {
    ex.sets = setsMap.get(ex.id) || [];
    for (const set of ex.sets) {
      set.targetReps = ex.targetReps; // Now safe to attach
    }
  }

  return workout;
}

// ─── Generating Workouts (Engine) ────────────────────────────────────────────

export async function generateWorkout(userId: string): Promise<Workout | null> {
  const member = await getMemberProfile(userId);
  if (!member) throw new Error("Member not found");

  if (!member.goal || !member.experience || !member.trainingFrequency) {
    throw new Error("Missing training profile configuration.");
  }

  // Prevent duplicate generation if one exists
  const existing = await getTodayWorkout(userId);
  if (existing) return existing;

  // Fetch all active exercises
  const allExRes = await db.execute(`SELECT * FROM exercises WHERE status = 'active' OR status IS NULL`);
  const globalExercises = allExRes.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    category: r.category as string,
    primaryMuscle: r.primary_muscle as string,
    secondaryMuscles: r.secondary_muscles as string | null,
    equipment: r.equipment as string | null,
    difficulty: r.difficulty as string | null,
    instructions: r.instructions as string | null,
    commonMistakes: r.common_mistakes as string | null,
    videoUrl: r.video_url as string | null,
    thumbnailUrl: r.thumbnail_url as string | null
  }));

  // Fetch workout history (last 14 days)
  const historyDate = new Date();
  historyDate.setDate(historyDate.getDate() - 14);
  const hRes = await db.execute({
    sql: `SELECT w.id, w.workout_date, we.exercise_id, e.category, e.primary_muscle,
                 we.sets, we.reps, ws.weight, ws.completed
          FROM workouts w
          JOIN workout_exercises we ON w.id = we.workout_id
          JOIN exercises e ON we.exercise_id = e.id
          LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id
          WHERE w.member_id = ? AND w.status = 'completed' AND w.workout_date >= ?
          ORDER BY w.workout_date DESC`,
    args: [member.memberId, historyDate.toISOString()]
  });

  const historyMap = new Map<string, any>();
  for (const row of hRes.rows) {
    const wId = row.id as string;
    if (!historyMap.has(wId)) {
      historyMap.set(wId, { workout_date: row.workout_date, exercises: [] });
    }
    historyMap.get(wId).exercises.push({
      exercise_id: row.exercise_id,
      category: row.category,
      primary_muscle: row.primary_muscle,
      sets: Number(row.sets),
      reps: Number(row.reps),
      weight: row.weight ? Number(row.weight) : null,
      completed: Boolean(row.completed)
    });
  }

  const { PersonalizationEngine } = await import("../../workout/engine");
  const engine = new PersonalizationEngine(member, Array.from(historyMap.values()), globalExercises);
  const { exercises, name, explanation } = engine.generate();

  if (exercises.length === 0) {
    throw new Error("No active exercises available to generate workout. Please contact the gym owner or Master Admin.");
  }

  const workoutId = crypto.randomUUID();
  const now = new Date().toISOString();

  const batchStmts: any[] = [
    {
      sql: `INSERT INTO workouts (id, member_id, name, workout_date, status, created_at, explanation) VALUES (?, ?, ?, ?, 'planned', ?, ?)`,
      args: [workoutId, member.memberId, name, now, now, explanation]
    }
  ];

  let order = 1;
  for (const ex of exercises) {
    const weId = crypto.randomUUID();
    batchStmts.push({
      sql: `INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, exercise_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [weId, workoutId, ex.exercise.id, ex.sets, ex.reps, ex.restSeconds, order]
    });

    for (let s = 1; s <= ex.sets; s++) {
      batchStmts.push({
        sql: `INSERT INTO workout_sets (id, workout_exercise_id, set_number, completed) VALUES (?, ?, ?, 0)`,
        args: [crypto.randomUUID(), weId, s]
      });
    }
    order++;
  }

  await db.batch(batchStmts);

  return getTodayWorkout(userId);
}

// ─── Modifying Workouts ──────────────────────────────────────────────────────

export async function updateWorkoutSet(userId: string, setId: string, weight: number, reps: number, completed: boolean) {
  // Security: Ensure this set belongs to the user
  const check = await db.execute({
    sql: `SELECT w.member_id FROM workout_sets ws
          JOIN workout_exercises we ON ws.workout_exercise_id = we.id
          JOIN workouts w ON we.workout_id = w.id
          JOIN members m ON w.member_id = m.id
          WHERE ws.id = ? AND m.user_id = ?`,
    args: [setId, userId]
  });
  if (check.rows.length === 0) throw new Error("Unauthorized or set not found");

  await db.execute({
    sql: `UPDATE workout_sets SET weight = ?, reps_completed = ?, completed = ? WHERE id = ?`,
    args: [weight, reps, completed ? 1 : 0, setId]
  });
}

export async function updateWorkoutStatus(userId: string, workoutId: string, status: 'in_progress' | 'completed') {
  const check = await db.execute({
    sql: `SELECT w.id FROM workouts w
          JOIN members m ON w.member_id = m.id
          WHERE w.id = ? AND m.user_id = ?`,
    args: [workoutId, userId]
  });
  if (check.rows.length === 0) throw new Error("Unauthorized or workout not found");

  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  await db.execute({
    sql: `UPDATE workouts SET status = ?, completed_at = ? WHERE id = ?`,
    args: [status, completedAt, workoutId]
  });
}

// ─── Dashboard Queries ───────────────────────────────────────────────────────

export async function getWorkoutHistory(userId: string) {
  const member = await getMemberProfile(userId);
  if (!member) return [];

  const res = await db.execute({
    sql: `SELECT w.id, w.name, w.workout_date, w.status, w.completed_at,
                 (SELECT COUNT(*) FROM workout_exercises WHERE workout_id = w.id) as exercise_count
          FROM workouts w
          WHERE w.member_id = ? AND w.status = 'completed'
          ORDER BY w.workout_date DESC
          LIMIT 20`,
    args: [member.memberId]
  });

  return res.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    date: r.workout_date as string,
    status: r.status as string,
    completedAt: r.completed_at as string | null,
    exerciseCount: Number(r.exercise_count)
  }));
}

export async function getOwnerWorkoutActivity(ownerUserId: string) {
  const ownerCheck = await db.execute({ sql: "SELECT id FROM gyms WHERE owner_id = ?", args: [ownerUserId] });
  if (ownerCheck.rows.length === 0) return [];
  const gymId = ownerCheck.rows[0].id as string;

  const res = await db.execute({
    sql: `SELECT w.id, w.name, w.workout_date, w.status, m.id as member_id, u.name as member_name
          FROM workouts w
          JOIN members m ON w.member_id = m.id
          JOIN users u ON m.user_id = u.id
          WHERE m.gym_id = ?
          ORDER BY w.workout_date DESC LIMIT 30`,
    args: [gymId]
  });

  return res.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    date: r.workout_date as string,
    status: r.status as string,
    memberName: r.member_name as string
  }));
}

export async function getAdminWorkoutActivity() {
  const res = await db.execute(`
    SELECT w.id, w.name, w.workout_date, w.status, u.name as member_name, g.name as gym_name
    FROM workouts w
    JOIN members m ON w.member_id = m.id
    JOIN users u ON m.user_id = u.id
    JOIN gyms g ON m.gym_id = g.id
    ORDER BY w.workout_date DESC LIMIT 50
  `);

  return res.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    date: r.workout_date as string,
    status: r.status as string,
    memberName: r.member_name as string,
    gymName: r.gym_name as string
  }));
}
