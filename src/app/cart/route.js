// File: /app/api/cart/route.js
import Connectdb from "../../../lib/connectdb";
import Cart from "../../../models/cart"; // define schema if missing
import { NextResponse } from "next/server";

export async function POST(req) {
  await Connectdb();
  try {
    const { userId, productId, quantity } = await req.json();

    if (!userId || !productId || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Upsert: update if already exists
    const existing = await Cart.findOne({ userId, productId });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await Cart.create({ userId, productId, quantity });
    }

    return NextResponse.json({ message: "Cart updated successfully" });
  } catch (err) {
    console.error("Cart error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
