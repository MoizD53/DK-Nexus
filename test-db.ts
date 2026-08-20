import { db } from "./src/lib/db";

async function testConnection() {
  try {
    console.log("Testing Turso database connection...");
    
    // A simple query to check connection
    const result = await db.execute("SELECT 1 AS status");
    
    if (result.rows && result.rows.length > 0) {
      console.log("✅ Connection successful!");
      console.log("Result:", result.rows[0]);
    } else {
      console.log("❌ Connection failed: No rows returned.");
    }
  } catch (error) {
    console.error("❌ Connection error:", error);
    process.exit(1);
  }
}

testConnection();
