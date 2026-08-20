import { db } from "./index";

async function migrateStep4() {
  try {
    console.log("Step 4 migration: checking members.status column...");

    // Check if status column already exists
    const pragma = await db.execute("PRAGMA table_info(members)");
    const hasStatus = pragma.rows.some((row) => row.name === "status");

    if (!hasStatus) {
      console.log("Adding status column to members table...");
      await db.execute(
        "ALTER TABLE members ADD COLUMN status TEXT NOT NULL DEFAULT 'active'"
      );
      console.log("✅ status column added.");
    } else {
      console.log("✅ status column already exists. Skipping.");
    }

    // Verify
    const verify = await db.execute("PRAGMA table_info(members)");
    console.log(
      "members columns:",
      verify.rows.map((r) => r.name)
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateStep4();
