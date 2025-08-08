import Connectdb from "../../../../../../lib/connectdb";
import User from "../../../../../../models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  await Connectdb();

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, cartItems } = body;

  if (!email || !Array.isArray(cartItems)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save cart (you should ideally validate schema)
    user.cart = cartItems;
    await user.save();

    return NextResponse.json({ message: "Cart saved successfully" });
  } catch (err) {
    console.error("Failed to save cart:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
