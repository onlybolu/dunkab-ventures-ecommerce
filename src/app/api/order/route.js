// src/app/api/order/route.js
import dbConnect from "../../../../lib/dbconnect";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";

// POST - Create order
export async function POST(request) {
  try {
    await dbConnect();

    // REMOVED: userName, userEmail from destructuring as they won't be saved directly on Order
    const { 
      userId, // This must be the actual MongoDB _id of the User document
      items, 
      totalAmount, 
      method, 
      deliveryInfo, 
      paymentStatus, 
      // orderStatus is derived below, not explicitly taken from body
    } = await request.json();

    // Clean prices (existing logic)
    const cleanedItems = items.map((item) => ({
      ...item,
      price: typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
        : item.price,
    }));

    const order = new Order({
      // CORRECTED: Save the user's _id into the 'user' field, which is a reference
      user: userId, 
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
    // Added more detailed logging for validation errors
    if (error.name === 'ValidationError') {
      console.error('Mongoose Validation Error Details:', error.errors);
    }
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch orders (This part is already correct for population)
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let orders;
    if (userId) {
      orders = await Order.find({ user: userId }) 
                            .populate({ path: 'user', select: 'name email' }) 
                            .sort({ createdAt: -1 });
    } else {
      orders = await Order.find()
                          .populate({
                            path: 'user',
                            select: 'name email' 
                          })
                          .sort({ createdAt: -1 });
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