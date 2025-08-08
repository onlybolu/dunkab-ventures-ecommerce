import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";
import { comparePassword } from "../../../../../lib/hash";
import { NextResponse } from "next/server";

export async function POST(req) {
  await Connectdb();

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, password } = body;

  // Check for missing fields
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Success
  return NextResponse.json({
    message: "Login successful",
    userId: user._id,
    name: user.name,
    email: user.email,
  });
}
