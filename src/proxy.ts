import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/auth/session";

const protectedRoutes = ["/admin", "/owner", "/member"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const role = session.role as string;

  // Role-based protection rules
  if (path.startsWith("/admin") && role !== "master_admin") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  
  if (path.startsWith("/owner") && role !== "owner") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  
  if (path.startsWith("/member") && role !== "member") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*", "/member/:path*"],
};
