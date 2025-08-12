import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";
import { hashPassword } from "../../../../../lib/hash";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "../../../../../lib/mailer";

export async function POST(req) {
  await Connectdb();

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, password } = body;

  // Check for missing fields
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "All fields (name, email, password) are required" },
      { status: 400 }
    );
  }

  // Validate name
  if (name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters long" }, { status: 400 });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Validate password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return NextResponse.json({ error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" }, { status: 400 });
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
    // Proceed anyway
  }

  return NextResponse.json({
    message: "User registered successfully",
    id: user._id,
    name: user.name,
    email: user.email,
  });
}