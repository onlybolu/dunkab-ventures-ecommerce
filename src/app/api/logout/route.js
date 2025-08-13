// /app/api/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  // Clear session cookie
  return new NextResponse(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Replace `session` with your cookie name
      "Set-Cookie": `session=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict; Secure`,
    },
  });
}
