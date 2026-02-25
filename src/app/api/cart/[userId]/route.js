import dbConnect from "../../../../../lib/dbconnect";
import User from "../../../../../models/user";

export async function GET(req, { params }) {
  await dbConnect();
  const { userId } = params;

  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found", cart: [] }), { status: 404 });
    }

    const cart = (user.cart || [])
      .filter((item) => item.productId)
      .map((item) => ({
        productId: String(item.productId._id),
        _id: String(item.productId._id),
        title: item.productId.title,
        name: item.productId.title,
        price: item.productId.price,
        quantity: item.quantity,
        color: item.color || "",
        image: item.productId.image,
        image1: item.productId.image1,
        image2: item.productId.image2,
      }));

    return new Response(JSON.stringify({ cart }), { status: 200 });
  } catch (err) {
    console.error("Error fetching cart:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch cart", cart: [] }), { status: 500 });
  }
}
