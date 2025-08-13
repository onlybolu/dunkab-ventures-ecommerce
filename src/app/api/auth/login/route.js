import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";
import { comparePassword } from "../../../../../lib/hash";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await Connectdb();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Create JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Create response
    const res = NextResponse.json({
      message: "Login successful",
      id: user._id,
      name: user.name,
      email: user.email,
    });

    // Set HTTP-only cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
