import { db } from "../index";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ─── Owner's gym ──────────────────────────────────────────────────────────────

/**
 * Returns the gym_id for an owner user.
 * ALWAYS call this server-side to scope all subsequent queries.
 */
export async function getOwnerGymId(userId: string): Promise<string | null> {
  const result = await db.execute({
    sql: "SELECT gym_id FROM users WHERE id = ? AND role = 'owner'",
    args: [userId],
  });
  if (result.rows.length === 0) return null;
  return (result.rows[0].gym_id as string) ?? null;
}

// ─── Member list ──────────────────────────────────────────────────────────────

export interface GymMember {
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

/**
 * Returns all members for a given gym, optionally filtered by search term.
 * gymId MUST come from the server session, never from client input.
 */
export async function getGymMembers(
  gymId: string,
  search = ""
): Promise<GymMember[]> {
  const q = search.trim();
  const like = `%${q}%`;

  const result = await db.execute({
    sql: `
      SELECT
        m.id          AS member_id,
        u.id          AS user_id,
        u.name,
        u.email,
        u.created_at,
        m.age,
        m.height,
        m.weight,
        m.goal,
        m.experience,
        m.training_frequency,
        m.status
      FROM members m
      JOIN users u ON u.id = m.user_id
      WHERE m.gym_id = ?
      ${q ? "AND (u.name LIKE ? OR u.email LIKE ?)" : ""}
      ORDER BY u.name ASC
    `,
    args: q ? [gymId, like, like] : [gymId],
  });

  return result.rows.map((r) => ({
    memberId: r.member_id as string,
    userId: r.user_id as string,
    name: r.name as string,
    email: r.email as string,
    age: r.age != null ? Number(r.age) : null,
    height: r.height != null ? Number(r.height) : null,
    weight: r.weight != null ? Number(r.weight) : null,
    goal: (r.goal as string) ?? null,
    experience: (r.experience as string) ?? null,
    trainingFrequency: r.training_frequency != null ? Number(r.training_frequency) : null,
    status: (r.status as string) ?? "active",
    createdAt: r.created_at as string,
  }));
}

/**
 * Returns a single member ONLY if they belong to the given gym.
 * gymId MUST come from the server session.
 */
export async function getGymMember(
  memberId: string,
  gymId: string
): Promise<GymMember | null> {
  const result = await db.execute({
    sql: `
      SELECT
        m.id          AS member_id,
        u.id          AS user_id,
        u.name,
        u.email,
        u.created_at,
        m.age,
        m.height,
        m.weight,
        m.goal,
        m.experience,
        m.training_frequency,
        m.status
      FROM members m
      JOIN users u ON u.id = m.user_id
      WHERE m.id = ? AND m.gym_id = ?
    `,
    args: [memberId, gymId],
  });

  if (result.rows.length === 0) return null;
  const r = result.rows[0];
  return {
    memberId: r.member_id as string,
    userId: r.user_id as string,
    name: r.name as string,
    email: r.email as string,
    age: r.age != null ? Number(r.age) : null,
    height: r.height != null ? Number(r.height) : null,
    weight: r.weight != null ? Number(r.weight) : null,
    goal: (r.goal as string) ?? null,
    experience: (r.experience as string) ?? null,
    trainingFrequency: r.training_frequency != null ? Number(r.training_frequency) : null,
    status: (r.status as string) ?? "active",
    createdAt: r.created_at as string,
  };
}

// ─── Create member ────────────────────────────────────────────────────────────

export interface CreateMemberInput {
  name: string;
  email: string;
  password: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  goal?: string | null;
  experience?: string | null;
}

/**
 * Creates a user (role=member) + members record.
 * gymId MUST come from the authenticated owner's session, never from client.
 */
export async function createMember(
  gymId: string,
  data: CreateMemberInput
): Promise<{ userId: string; memberId: string }> {
  // Check email uniqueness
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [data.email.toLowerCase()],
  });
  if (existing.rows.length > 0) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const userId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  // Create user record — role is always 'member', gym_id is always from session
  await db.execute({
    sql: `INSERT INTO users (id, name, email, password_hash, role, gym_id)
          VALUES (?, ?, ?, ?, 'member', ?)`,
    args: [userId, data.name.trim(), data.email.toLowerCase(), passwordHash, gymId],
  });

  // Create member profile record
  await db.execute({
    sql: `INSERT INTO members (id, user_id, gym_id, age, height, weight, goal, experience, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    args: [
      memberId,
      userId,
      gymId,
      data.age ?? null,
      data.height ?? null,
      data.weight ?? null,
      data.goal ?? null,
      data.experience ?? null,
    ],
  });

  return { userId, memberId };
}

// ─── Update member ────────────────────────────────────────────────────────────

export interface UpdateMemberInput {
  name: string;
  email: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  goal?: string | null;
  experience?: string | null;
}

/**
 * Updates user + member fields.
 * The WHERE clause always includes gymId from the server session.
 */
export async function updateGymMember(
  memberId: string,
  gymId: string,
  data: UpdateMemberInput
): Promise<void> {
  // First verify this member belongs to the gym (security check)
  const member = await getGymMember(memberId, gymId);
  if (!member) throw new Error("MEMBER_NOT_FOUND");

  // Check email uniqueness (excluding current user)
  if (data.email.toLowerCase() !== member.email) {
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? AND id != ?",
      args: [data.email.toLowerCase(), member.userId],
    });
    if (existing.rows.length > 0) throw new Error("EMAIL_TAKEN");
  }

  // Update users table
  await db.execute({
    sql: `UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [data.name.trim(), data.email.toLowerCase(), member.userId],
  });

  // Update members table — gymId in WHERE is the security anchor
  await db.execute({
    sql: `UPDATE members
          SET age = ?, height = ?, weight = ?, goal = ?, experience = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND gym_id = ?`,
    args: [
      data.age ?? null,
      data.height ?? null,
      data.weight ?? null,
      data.goal ?? null,
      data.experience ?? null,
      memberId,
      gymId,
    ],
  });
}

// ─── Toggle status ────────────────────────────────────────────────────────────

/**
 * Activates or deactivates a member.
 * gymId is ALWAYS from the server session to prevent cross-gym manipulation.
 */
export async function toggleMemberStatus(
  memberId: string,
  gymId: string,
  newStatus: "active" | "inactive"
): Promise<void> {
  // The AND gym_id = ? prevents an owner from toggling a member from another gym
  const result = await db.execute({
    sql: `UPDATE members SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND gym_id = ?`,
    args: [newStatus, memberId, gymId],
  });

  if (result.rowsAffected === 0) {
    throw new Error("MEMBER_NOT_FOUND");
  }
}

// ─── Gym Progress ─────────────────────────────────────────────────────────────

export interface MemberProgressSummary {
  memberId: string;
  userId: string;
  name: string;
  currentWeight: number | null;
  workoutsCompleted: number;
  lastWorkoutDate: string | null;
  completionRate: number;
}

export async function getGymProgress(gymId: string): Promise<MemberProgressSummary[]> {
  const result = await db.execute({
    sql: `
      SELECT 
        m.id as member_id, 
        u.id as user_id, 
        u.name, 
        m.weight as current_weight,
        COUNT(CASE WHEN w.status = 'completed' THEN 1 END) as workouts_completed,
        COUNT(w.id) as total_workouts,
        MAX(CASE WHEN w.status = 'completed' THEN w.workout_date END) as last_workout_date
      FROM members m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN workouts w ON m.id = w.member_id AND w.status != 'cancelled'
      WHERE m.gym_id = ?
      GROUP BY m.id
      ORDER BY last_workout_date DESC NULLS LAST
    `,
    args: [gymId]
  });

  return result.rows.map(r => {
    const completed = Number(r.workouts_completed);
    const total = Number(r.total_workouts);
    return {
      memberId: r.member_id as string,
      userId: r.user_id as string,
      name: r.name as string,
      currentWeight: r.current_weight != null ? Number(r.current_weight) : null,
      workoutsCompleted: completed,
      lastWorkoutDate: r.last_workout_date ? (r.last_workout_date as string).split('T')[0] : null,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });
}
