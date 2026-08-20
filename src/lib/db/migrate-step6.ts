import { db } from "./index";

async function migrateStep6() {
  try {
    console.log("Step 6 migration: Adding name to workouts table...");

    // SQLite ALTER TABLE ADD COLUMN
    // First check if column exists (SQLite doesn't have a direct IF NOT EXISTS for columns, 
    // so we catch the error if it already exists).
    try {
      await db.execute(`ALTER TABLE workouts ADD COLUMN name TEXT NOT NULL DEFAULT 'Today''s Workout'`);
      console.log("Added 'name' column to workouts.");
    } catch (e: any) {
      if (e.message && e.message.includes("duplicate column name")) {
        console.log("Column 'name' already exists on workouts, skipping.");
      } else {
        throw e;
      }
    }

    console.log("✅ Step 6 migration complete.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateStep6();
