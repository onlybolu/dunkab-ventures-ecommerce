import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Session API: Decoded JWT payload:", decoded);

    return NextResponse.json({ user: decoded });
  } catch (error) {
    console.error("Session API: Error verifying token:", error); // More specific error log
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }
}
