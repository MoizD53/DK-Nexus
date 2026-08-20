import { db } from "../index";

export interface MemberProfile {
  id: string;
  memberId: string;
  name: string;
  email: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  experience: string | null;
  trainingFrequency: number | null;
  gymId: string;
  gymName: string;
  joinedAt: string;
}

/**
 * Fetches the member profile for the authenticated user.
 * userId comes exclusively from the server session — never from client input.
 */
export async function getMemberProfile(userId: string): Promise<MemberProfile | null> {
  const result = await db.execute({
    sql: `SELECT m.id as member_id, m.age, m.height, m.weight, m.goal, m.experience, m.training_frequency, m.status,
                 u.id as user_id, u.name, u.email, u.created_at,
                 g.id as gym_id, g.name as gym_name
          FROM members m
          JOIN users u ON m.user_id = u.id
          JOIN gyms g ON m.gym_id = g.id
          WHERE u.id = ?`,
    args: [userId]
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  if (row.status === 'inactive') return null;

  return {
    id: row.user_id as string,
    memberId: row.member_id as string,
    name: row.name as string,
    email: row.email as string,
    age: row.age as number | null,
    height: row.height as number | null,
    weight: row.weight as number | null,
    goal: row.goal as string | null,
    experience: row.experience as string | null,
    trainingFrequency: row.training_frequency as number | null,
    gymId: row.gym_id as string,
    gymName: row.gym_name as string,
    joinedAt: row.created_at as string
  };
}

export interface UpdateProfileInput {
  name: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  goal?: string | null;
  experience?: string | null;
  trainingFrequency?: number | null;
}

/**
 * Updates the member's personal/fitness profile.
 * userId from session is the WHERE anchor — role/gym_id/user_id cannot be changed.
 */
export async function updateMemberProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<void> {
  // Update name in users table
  await db.execute({
    sql: `UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [data.name.trim(), userId],
  });

  // Update fitness data in members table — userId is always from session
  await db.execute({
    sql: `UPDATE members
          SET age = ?, height = ?, weight = ?, goal = ?, experience = ?, training_frequency = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?`,
    args: [
      data.age ?? null,
      data.height ?? null,
      data.weight ?? null,
      data.goal ?? null,
      data.experience ?? null,
      data.trainingFrequency ?? null,
      userId,
    ],
  });
}
