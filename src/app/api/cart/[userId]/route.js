import dbConnect from "../../../../../lib/dbconnect";
import User from "../../../../../models/user";

export async function GET(req, context) {
  await dbConnect();
  const { userId } = await context.params; 

  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const cart = user.cart.map((item) => ({
      _id: item.productId._id,
      name: item.productId.title,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.image,
      image1: item.productId.image1,
      image2: item.productId.image2,
    }));

    return new Response(JSON.stringify({ cart }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch cart" }), { status: 500 });
  }
}

