import dbConnect from "../../../../../lib/dbconnect";
import Product from "../../../../../models/product";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await dbConnect();

  try {
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

