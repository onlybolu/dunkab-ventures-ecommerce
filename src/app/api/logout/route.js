
import { NextResponse } from "next/server";

export async function POST() {
  // Clear the 'token' cookie that holds the JWT
  return new NextResponse(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // CRITICAL FIX: Change 'session' to 'token'
      "Set-Cookie": `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict; Secure`,
    },
  });
}