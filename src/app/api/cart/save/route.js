// /api/cart/save.js
import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";


export async function POST(req) {
  await Connectdb();

  try {
    const { userId, cart } = await req.json();

    if (!userId || !Array.isArray(cart)) {
      return new Response(JSON.stringify({ error: "Invalid data" }), { status: 400 });
    }

   
    const formattedCart = cart.map((item) => ({
      productId: item.productId || item._id, // accept either product ID field
      quantity: item.quantity,
      color: item.color, // include the 'color' field
    }));
    
    await User.findByIdAndUpdate(userId, { cart: formattedCart });

    return new Response(JSON.stringify({ message: "Cart updated" }), { status: 200 });
  } catch (err) {
    console.error("Error in /api/cart/save:", err); // Log the actual error for debugging
    return new Response(JSON.stringify({ error: "Failed to save cart" }), { status: 500 });
  }
}