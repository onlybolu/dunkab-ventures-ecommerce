import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";
import { hashPassword } from "../../../../../lib/hash";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "../../../../../lib/mailer";

export async function POST(req) {
  await Connectdb();
  const { name, email, password } = await req.json();

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  // Send welcome email
  try {
    await sendWelcomeEmail(email, name);
  } catch (error) {
    console.error("Failed to send email:", error);
    // Still return success — just log the email error
  }

  return NextResponse.json({ message: "User registered successfully", userId: user._id });
}
