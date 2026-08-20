"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let role = "";

  try {
    const result = await db.execute({
      sql: "SELECT id, password_hash, role FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return { error: "Invalid credentials" };
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash as string);

    if (!validPassword) {
      return { error: "Invalid credentials" };
    }

    role = user.role as string;

    if (role === 'member') {
      const memberCheck = await db.execute({
        sql: "SELECT status FROM members WHERE user_id = ?",
        args: [user.id],
      });
      if (memberCheck.rows.length > 0 && memberCheck.rows[0].status === 'inactive') {
        return { error: "Account inactive. Please contact your gym owner." };
      }
    }

    await createSession(user.id as string, role);

  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong during login." };
  }

  // Redirect must happen outside try/catch
  if (role === "master_admin") {
    redirect("/admin");
  } else if (role === "owner") {
    redirect("/owner");
  } else if (role === "member") {
    redirect("/member");
  } else {
    redirect("/"); // fallback
  }
}
