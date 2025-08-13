import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";
// import { NextResponse } from "next/server";

export async function POST(req) {
  await Connectdb();

  try {
    const { userId, cart } = await req.json();

    if (!userId || !Array.isArray(cart)) {
      return new Response(JSON.stringify({ error: "Invalid data" }), { status: 400 });
    }

    const formattedCart = cart.map((item) => ({
      productId: item.productId || item._id, // accept either field
      quantity: item.quantity,
    }));
    

    await User.findByIdAndUpdate(userId, { cart: formattedCart });

    return new Response(JSON.stringify({ message: "Cart updated" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to save cart" }), { status: 500 });
  }
}

