import { db } from "../index";

export interface AdminStats {
  totalGyms: number;
  activeGyms: number;
  totalMembers: number;
  activeMembers: number;
  workoutsToday: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [gymsRes, activeGymsRes, membersRes, activeMembersRes, workoutsRes] =
    await Promise.all([
      db.execute("SELECT COUNT(*) as count FROM gyms"),
      db.execute(
        "SELECT COUNT(DISTINCT gym_id) as count FROM members WHERE status = 'active'"
      ),
      db.execute("SELECT COUNT(*) as count FROM members"),
      db.execute(
        "SELECT COUNT(*) as count FROM members WHERE status = 'active'"
      ),
      db.execute(
        "SELECT COUNT(*) as count FROM workouts WHERE DATE(workout_date) = DATE('now')"
      ),
    ]);

  return {
    totalGyms: Number(gymsRes.rows[0]?.count ?? 0),
    activeGyms: Number(activeGymsRes.rows[0]?.count ?? 0),
    totalMembers: Number(membersRes.rows[0]?.count ?? 0),
    activeMembers: Number(activeMembersRes.rows[0]?.count ?? 0),
    workoutsToday: Number(workoutsRes.rows[0]?.count ?? 0),
  };
}

export interface GymWithDetails {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  memberCount: number;
  activeMemberCount: number;
  createdAt: string;
}

export async function getAllGymsWithDetails(): Promise<GymWithDetails[]> {
  const result = await db.execute(`
    SELECT
      g.id,
      g.name,
      g.created_at,
      u.name  AS owner_name,
      u.email AS owner_email,
      COUNT(m.id)                                    AS member_count,
      SUM(CASE WHEN m.status = 'active' THEN 1 ELSE 0 END) AS active_member_count
    FROM gyms g
    LEFT JOIN users u ON u.id = g.owner_id
    LEFT JOIN members m ON m.gym_id = g.id
    GROUP BY g.id, g.name, g.created_at, u.name, u.email
    ORDER BY g.created_at DESC
  `);

  return result.rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    ownerName: (r.owner_name as string) ?? "Unknown",
    ownerEmail: (r.owner_email as string) ?? "",
    memberCount: Number(r.member_count ?? 0),
    activeMemberCount: Number(r.active_member_count ?? 0),
    createdAt: r.created_at as string,
  }));
}

export interface AdminMember {
  userId: string;
  memberId: string;
  name: string;
  email: string;
  gymName: string;
  gymId: string;
  age: number | null;
  goal: string | null;
  experience: string | null;
  status: string;
  createdAt: string;
}

export async function getAllMembers(search = ""): Promise<AdminMember[]> {
  const q = search.trim();
  const like = `%${q}%`;

  const result = await db.execute({
    sql: `
      SELECT
        u.id   AS user_id,
        u.name,
        u.email,
        u.created_at,
        m.id   AS member_id,
        m.age,
        m.goal,
        m.experience,
        m.status,
        g.id   AS gym_id,
        g.name AS gym_name
      FROM members m
      JOIN users u ON u.id = m.user_id
      JOIN gyms g  ON g.id = m.gym_id
      ${q ? "WHERE u.name LIKE ? OR u.email LIKE ?" : ""}
      ORDER BY u.name ASC
    `,
    args: q ? [like, like] : [],
  });

  return result.rows.map((r) => ({
    userId: r.user_id as string,
    memberId: r.member_id as string,
    name: r.name as string,
    email: r.email as string,
    gymName: r.gym_name as string,
    gymId: r.gym_id as string,
    age: r.age != null ? Number(r.age) : null,
    goal: (r.goal as string) ?? null,
    experience: (r.experience as string) ?? null,
    status: (r.status as string) ?? "active",
    createdAt: r.created_at as string,
  }));
}

export interface PlatformActivity {
  totalWorkouts: number;
  workoutsToday: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  recentWorkouts: {
    workoutId: string;
    workoutName: string;
    memberName: string;
    gymName: string;
    date: string;
    status: string;
  }[];
}

export async function getPlatformActivity(): Promise<PlatformActivity> {
  const [totalsRes, recentRes] = await Promise.all([
    db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(workout_date) = DATE('now') THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN workout_date >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as this_week,
        SUM(CASE WHEN workout_date >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as this_month
      FROM workouts
      WHERE status = 'completed'
    `),
    db.execute(`
      SELECT w.id, w.name as workout_name, w.workout_date, w.status, u.name as member_name, g.name as gym_name
      FROM workouts w
      JOIN members m ON w.member_id = m.id
      JOIN users u ON m.user_id = u.id
      JOIN gyms g ON m.gym_id = g.id
      ORDER BY w.workout_date DESC
      LIMIT 20
    `)
  ]);

  const totals = totalsRes.rows[0];
  
  const recentWorkouts = recentRes.rows.map(r => ({
    workoutId: r.id as string,
    workoutName: r.workout_name as string,
    memberName: r.member_name as string,
    gymName: r.gym_name as string,
    date: r.workout_date as string,
    status: r.status as string
  }));

  return {
    totalWorkouts: Number(totals?.total ?? 0),
    workoutsToday: Number(totals?.today ?? 0),
    workoutsThisWeek: Number(totals?.this_week ?? 0),
    workoutsThisMonth: Number(totals?.this_month ?? 0),
    recentWorkouts
  };
}
