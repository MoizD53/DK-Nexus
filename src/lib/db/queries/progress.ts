import { db } from "../index";
import crypto from "crypto";
import { getMemberProfile } from "./member";

export interface ProgressEntry {
  id: string;
  weight: number;
  recordedAt: string;
  notes: string | null;
}

export interface ProgressStats {
  currentWeight: number | null;
  startingWeight: number | null;
  weightChange: number | null;
  totalWorkouts: number;
  completedWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  completionRate: number;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
}

export async function getMemberProgress(userId: string): Promise<{
  stats: ProgressStats;
  history: ProgressEntry[];
  prs: PersonalRecord[];
}> {
  const member = await getMemberProfile(userId);
  if (!member) throw new Error("Member not found");

  // 1. Weight History
  const weightRes = await db.execute({
    sql: `SELECT id, weight, recorded_at, notes FROM progress 
          WHERE member_id = ? ORDER BY recorded_at DESC`,
    args: [member.memberId]
  });

  const history = weightRes.rows.map(r => ({
    id: r.id as string,
    weight: Number(r.weight),
    recordedAt: r.recorded_at as string,
    notes: r.notes as string | null
  }));

  const currentWeight = history.length > 0 ? history[0].weight : (member.weight || null);
  const startingWeight = history.length > 0 ? history[history.length - 1].weight : (member.weight || null);
  const weightChange = (currentWeight && startingWeight) ? (currentWeight - startingWeight) : null;

  // 2. Workout Stats
  const wRes = await db.execute({
    sql: `SELECT workout_date, status, completed_at FROM workouts WHERE member_id = ? AND status != 'cancelled' ORDER BY workout_date ASC`,
    args: [member.memberId]
  });

  const workouts = wRes.rows.map(r => ({
    date: (r.workout_date as string).split('T')[0],
    status: r.status as string
  }));

  const completedWorkouts = workouts.filter(w => w.status === 'completed');
  const completionRate = workouts.length > 0 ? Math.round((completedWorkouts.length / workouts.length) * 100) : 0;

  // Calculate streaks based on unique days of completed workouts
  const completedDates = [...new Set(completedWorkouts.map(w => w.date))].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of completedDates) {
    const currDate = new Date(dateStr);
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Allow up to 7 days gap between workouts to maintain a streak
      if (diffDays <= 7) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    lastDate = currDate;
  }

  // Current streak check (must have worked out in the last 7 days)
  const now = new Date();
  const daysSinceLastWorkout = lastDate 
    ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) 
    : 999;

  if (daysSinceLastWorkout <= 7) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  // This week & month
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const workoutsThisWeek = completedWorkouts.filter(w => new Date(w.date) >= startOfWeek).length;
  const workoutsThisMonth = completedWorkouts.filter(w => new Date(w.date) >= startOfMonth).length;

  // 3. PRs
  const prRes = await db.execute({
    sql: `SELECT e.name as exercise_name, MAX(ws.weight) as max_weight 
          FROM workout_sets ws
          JOIN workout_exercises we ON ws.workout_exercise_id = we.id
          JOIN workouts w ON we.workout_id = w.id
          JOIN exercises e ON we.exercise_id = e.id
          WHERE w.member_id = ? AND ws.completed = 1 AND ws.weight IS NOT NULL AND ws.weight > 0
          GROUP BY e.id
          ORDER BY max_weight DESC LIMIT 10`,
    args: [member.memberId]
  });

  const prs = prRes.rows.map(r => ({
    exerciseName: r.exercise_name as string,
    maxWeight: Number(r.max_weight)
  }));

  return {
    stats: {
      currentWeight,
      startingWeight,
      weightChange,
      totalWorkouts: workouts.length,
      completedWorkouts: completedWorkouts.length,
      currentStreak,
      longestStreak,
      workoutsThisWeek,
      workoutsThisMonth,
      completionRate
    },
    history,
    prs
  };
}

export async function addWeightEntry(userId: string, weight: number, notes: string | null) {
  const member = await getMemberProfile(userId);
  if (!member) throw new Error("Member not found");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.batch([
    {
      sql: `INSERT INTO progress (id, member_id, weight, recorded_at, notes) VALUES (?, ?, ?, ?, ?)`,
      args: [id, member.memberId, weight, now, notes || null]
    },
    {
      sql: `UPDATE members SET weight = ? WHERE id = ?`,
      args: [weight, member.memberId]
    }
  ]);
}

export interface ExercisePerformanceEntry {
  workoutId: string;
  workoutDate: string;
  workoutName: string;
  bestWeight: number;
  totalReps: number;
  sets: number;
}

export async function getExercisePerformance(userId: string, exerciseId: string): Promise<{
  history: ExercisePerformanceEntry[];
  personalBest: number | null;
}> {
  const member = await getMemberProfile(userId);
  if (!member) throw new Error("Member not found");

  const hRes = await db.execute({
    sql: `
      SELECT 
        w.id as workout_id,
        w.workout_date,
        w.name as workout_name,
        MAX(ws.weight) as best_weight,
        SUM(ws.reps_completed) as total_reps,
        COUNT(ws.id) as sets
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN workout_sets ws ON we.id = ws.workout_exercise_id
      WHERE w.member_id = ? AND we.exercise_id = ? AND w.status = 'completed' AND ws.completed = 1
      GROUP BY w.id, w.workout_date, w.name
      ORDER BY w.workout_date DESC
    `,
    args: [member.memberId, exerciseId]
  });

  const history = hRes.rows.map(r => ({
    workoutId: r.workout_id as string,
    workoutDate: r.workout_date as string,
    workoutName: r.workout_name as string,
    bestWeight: Number(r.best_weight),
    totalReps: Number(r.total_reps),
    sets: Number(r.sets)
  }));

  const pbRes = await db.execute({
    sql: `
      SELECT MAX(ws.weight) as max_weight
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN workout_sets ws ON we.id = ws.workout_exercise_id
      WHERE w.member_id = ? AND we.exercise_id = ? AND w.status = 'completed' AND ws.completed = 1
    `,
    args: [member.memberId, exerciseId]
  });

  const personalBest = pbRes.rows[0]?.max_weight ? Number(pbRes.rows[0].max_weight) : null;

  return { history, personalBest };
}
