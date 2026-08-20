import { db } from "./index";
import crypto from "crypto";

const initialCategories = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Abs",
  "Cardio",
];

async function migrateStep5() {
  try {
    console.log("Step 5 migration: Creating exercise_categories table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS exercise_categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if empty
    const check = await db.execute("SELECT COUNT(*) as count FROM exercise_categories");
    if (Number(check.rows[0].count) === 0) {
      console.log("Seeding initial categories...");
      for (const name of initialCategories) {
        await db.execute({
          sql: "INSERT INTO exercise_categories (id, name) VALUES (?, ?)",
          args: [crypto.randomUUID(), name],
        });
      }
    }

    console.log("✅ Step 5 migration complete.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateStep5();
