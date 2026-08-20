import { db } from "./index";

async function main() {
  console.log("Starting Step 10 Database Audit Migrations...");

  try {
    console.log("Adding status to exercises for safe soft-deletion...");
    await db.execute("ALTER TABLE exercises ADD COLUMN status TEXT DEFAULT 'active'");
    console.log("✓ Added status column to exercises.");
  } catch (err: any) {
    if (err.message.includes("duplicate column name")) {
      console.log("✓ exercises.status already exists.");
    } else {
      console.error("Error adding status:", err.message);
    }
  }

  // Update any existing null statuses (if applicable)
  await db.execute("UPDATE exercises SET status = 'active' WHERE status IS NULL");

  console.log("Migrations complete.");
}

main().catch(console.error);
