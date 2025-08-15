// src/app/api/order/route.js
import dbConnect from "../../../../lib/dbconnect";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";

// POST - Create order
export async function POST(request) {
  try {
    await dbConnect();

    // CORRECTED: Destructure userId, userName, and userEmail as separate fields
    const { 
      userId, 
      userName, 
      userEmail, 
      items, 
      totalAmount, 
      method, 
      deliveryInfo, 
      paymentStatus, 
      orderStatus 
    } = await request.json();

    // Clean prices (existing logic)
    const cleanedItems = items.map((item) => ({
      ...item,
      price: typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
        : item.price,
    }));

    const order = new Order({
      // CORRECTED: Map the destructured fields to the Order schema
      userId: userId, 
      userName: userName, 
      userEmail: userEmail, 
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

// GET - Fetch orders (No changes needed here for the current issue)
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let orders;
    if (userId) {
      orders = await Order.find({ userId: userId }).sort({ createdAt: -1 }); // Ensure it's userId: userId
    } else {
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