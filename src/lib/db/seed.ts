import { db } from "./index";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function seed() {
  try {
    console.log("Seeding development database...");

    const masterAdminId = crypto.randomUUID();
    const ownerId = crypto.randomUUID();
    const memberId = crypto.randomUUID();
    const gymId = crypto.randomUUID();

    // Hashed password for 'password123'
    const passwordHash = await bcrypt.hash("password123", 10);

    // Clean up existing data to avoid conflicts during multiple runs
    await db.executeMultiple(`
      DELETE FROM progress;
      DELETE FROM workout_sets;
      DELETE FROM workout_exercises;
      DELETE FROM workouts;
      DELETE FROM exercises;
      DELETE FROM members;
      DELETE FROM users;
      DELETE FROM gyms;
    `);

    // Create a Gym
    await db.execute({
      sql: "INSERT INTO gyms (id, name, owner_id) VALUES (?, ?, ?)",
      args: [gymId, "Development Gym", ownerId],
    });

    // Create users
    await db.execute({
      sql: "INSERT INTO users (id, name, email, password_hash, role, gym_id) VALUES (?, ?, ?, ?, ?, ?)",
      args: [masterAdminId, "Master Admin", "admin@dknexus.com", passwordHash, "master_admin", null],
    });

    await db.execute({
      sql: "INSERT INTO users (id, name, email, password_hash, role, gym_id) VALUES (?, ?, ?, ?, ?, ?)",
      args: [ownerId, "Gym Owner", "owner@dknexus.com", passwordHash, "owner", gymId],
    });

    await db.execute({
      sql: "INSERT INTO users (id, name, email, password_hash, role, gym_id) VALUES (?, ?, ?, ?, ?, ?)",
      args: [memberId, "Gym Member", "member@dknexus.com", passwordHash, "member", gymId],
    });

    // Create member profile
    await db.execute({
      sql: "INSERT INTO members (id, user_id, gym_id, age, height, weight, goal, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), memberId, gymId, 25, 180, 75, "Build muscle", "intermediate"],
    });

    console.log("✅ Seeding completed!");
    console.log("---");
    console.log("Test Credentials (Password for all: password123):");
    console.log("- admin@dknexus.com (Master Admin)");
    console.log("- owner@dknexus.com (Owner)");
    console.log("- member@dknexus.com (Member)");
    console.log("---");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
