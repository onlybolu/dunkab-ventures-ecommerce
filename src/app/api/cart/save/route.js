import Connectdb from "../../../../../lib/connectdb";
import User from "../../../../../models/user";

const normalizeColor = (color) => (color ? String(color).toLowerCase().trim() : "");

export async function POST(req) {
  await Connectdb();

  try {
    const { userId, cart } = await req.json();

    if (!userId || !Array.isArray(cart)) {
      return new Response(JSON.stringify({ error: "Invalid data" }), { status: 400 });
    }

    const formattedCart = cart
      .map((item) => ({
        productId: item.productId || item._id,
        quantity: Math.max(1, Number(item.quantity) || 1),
        color: normalizeColor(item.color),
      }))
      .filter((item) => item.productId);

    await User.findByIdAndUpdate(
      userId,
      { cart: formattedCart },
      { new: false, runValidators: false }
    );

    return new Response(JSON.stringify({ message: "Cart updated", cartSize: formattedCart.length }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error in /api/cart/save:", err);
    return new Response(JSON.stringify({ error: "Failed to save cart" }), { status: 500 });
  }
}
