import { db } from "./index";

async function migrateStep8() {
  try {
    console.log("Step 8 migration: Personalization Engine Fields...");

    try {
      await db.execute(`ALTER TABLE members ADD COLUMN training_frequency INTEGER DEFAULT 3`);
      console.log("Added 'training_frequency' column to members.");
    } catch (e: any) {
      if (e.message && e.message.includes("duplicate column name")) {
        console.log("Column 'training_frequency' already exists.");
      } else {
        throw e;
      }
    }

    try {
      await db.execute(`ALTER TABLE workouts ADD COLUMN explanation TEXT`);
      console.log("Added 'explanation' column to workouts.");
    } catch (e: any) {
      if (e.message && e.message.includes("duplicate column name")) {
        console.log("Column 'explanation' already exists.");
      } else {
        throw e;
      }
    }

    console.log("✅ Step 8 migration complete.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateStep8();
