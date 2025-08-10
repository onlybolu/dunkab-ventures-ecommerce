import dbConnect from "../../../../lib/dbconnect";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";

// POST - Create order
export async function POST(request) {
  try {
    await dbConnect();

    const { user, items, totalAmount, method, deliveryInfo, paymentStatus, orderStatus } =
      await request.json();

    // Clean prices
    const cleanedItems = items.map((item) => ({
      ...item,
      price: typeof item.price === "string"
        ? parseFloat(item.price.replace(/,/g, ""))
        : item.price,
    }));

    const order = new Order({
      user,
      items: cleanedItems,
      totalAmount: typeof totalAmount === "string"
        ? parseFloat(totalAmount.replace(/,/g, ""))
        : totalAmount,
      method,
      deliveryInfo,
      paymentStatus,
      orderStatus: paymentStatus === "failed" ? "cancelled" : "pending",
    });

    await order.save();

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Error saving order:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch orders
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let orders;
    if (userId) {
      //Return orders for specific user
      orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    } else {
      //Return all orders (admin)
      orders = await Order.find().sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
