import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";
import { verifyPassword } from "../../../../../lib/hash";
import { NextResponse } from "next/server";

export async function POST(req) {
  await Connectdb();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

  return NextResponse.json({ message: "Login successful", userId: user._id });
}
