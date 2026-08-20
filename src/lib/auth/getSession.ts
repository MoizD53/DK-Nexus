import { cookies } from "next/headers";
import { decrypt } from "./session";

export interface SessionPayload {
  userId: string;
  role: string;
}

/**
 * Reads and decrypts the session JWT from the HTTP-only cookie.
 * Returns null if no valid session exists.
 * Must only be called from Server Components or Server Actions.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  const payload = await decrypt(sessionCookie);
  if (!payload || !payload.userId || !payload.role) return null;

  return {
    userId: payload.userId as string,
    role: payload.role as string,
  };
}

/**
 * Like getSession() but throws if the session is missing or role doesn't match.
 * Use in Server Actions to enforce authentication + authorization.
 */
export async function requireSession(
  requiredRole?: string
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (requiredRole && session.role !== requiredRole) throw new Error("FORBIDDEN");
  return session;
}
