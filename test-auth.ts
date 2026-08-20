import { db } from "./src/lib/db";
import bcrypt from "bcryptjs";
import { encrypt } from "./src/lib/auth/session";

async function verifyAuth() {
  console.log("Verifying roles and protection...");

  const verifyRole = async (role: string, targetPath: string, expectedAccess: boolean) => {
    // Generate a valid JWT for the role
    const sessionCookie = await encrypt({ userId: "test-id", role, expiresAt: new Date(Date.now() + 10000) });
    
    // Make a request to the protected route (assuming local dev server is running, or we can just test the logic)
    try {
      const response = await fetch(`http://localhost:3000${targetPath}`, {
        headers: {
          Cookie: `session=${sessionCookie}`
        },
        redirect: 'manual'
      });
      
      const status = response.status;
      // 307 or 308 means redirect to /login
      // 200 means success
      const success = (status === 200) === expectedAccess;
      
      console.log(`${role.padEnd(15)} -> ${targetPath.padEnd(10)} [${success ? "✓ PASS" : "❌ FAIL"}] (Status: ${status})`);
    } catch (e) {
      console.log(`Failed to fetch http://localhost:3000${targetPath} - is the dev server running?`);
    }
  };

  await verifyRole("master_admin", "/admin", true);
  await verifyRole("owner", "/owner", true);
  await verifyRole("member", "/member", true);
  
  await verifyRole("member", "/admin", false);
  await verifyRole("member", "/owner", false);
  await verifyRole("owner", "/admin", false);
}

verifyAuth();
