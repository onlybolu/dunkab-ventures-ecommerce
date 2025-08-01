import dbConnect from "../../../../lib/dbconnect";
import Product from "../../../../models/product";

export async function GET(req) {
  try {
    await dbConnect();

    // Find products sorted by price (highest first)
    const products = await Product.find().sort({ price: -1 }).limit(6);

    return Response.json(products);
  } catch (error) {
    console.error("Fetch error:", error);
    return Response.json({ message: "Failed to load products" }, { status: 500 });
  }
}
