import { NextResponse } from "next/server";
import User from "../../../../models/user";
import Connectdb from "../../../../lib/connectdb";

const normalizeColor = (color) => (color ? String(color).toLowerCase().trim() : "");

export async function POST(req) {
  try {
    await Connectdb();
    const { userId, productId, quantity = 1, color = "" } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const normalizedColor = normalizeColor(color);
    const existing = user.cart.find(
      (item) => String(item.productId) === String(productId) && normalizeColor(item.color) === normalizedColor
    );

    if (existing) {
      existing.quantity = Math.max(1, Number(existing.quantity || 1) + Number(quantity || 1));
    } else {
      user.cart.push({ productId, quantity: Math.max(1, Number(quantity) || 1), color: normalizedColor });
    }

    await user.save();
    return NextResponse.json({ message: "Product added to cart" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add product to cart" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await Connectdb();
    const { userId, productId, color = "" } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const normalizedColor = normalizeColor(color);
    user.cart = user.cart.filter(
      (item) => !(String(item.productId) === String(productId) && normalizeColor(item.color) === normalizedColor)
    );

    await user.save();
    return NextResponse.json({ message: "Product removed from cart" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to remove product from cart" }, { status: 500 });
  }
}
