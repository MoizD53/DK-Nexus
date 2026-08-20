import { db } from "./index";
import * as fs from "fs";
import * as path from "path";

async function migrate() {
  try {
    console.log("Reading schema.sql...");
    const schemaPath = path.join(process.cwd(), "src/lib/db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    console.log("Applying migrations to Turso...");
    
    // Split the schema into individual statements
    // libSQL executeMultiple works best with this, though it accepts a string.
    await db.executeMultiple(schema);

    console.log("✅ Migration completed successfully!");
    
    // Verify tables were created
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table';");
    const tables = result.rows.map((row) => row.name);
    console.log("Tables in database:", tables);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
