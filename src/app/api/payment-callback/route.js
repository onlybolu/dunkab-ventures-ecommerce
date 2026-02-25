import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbconnect";
import Order from "../../../../models/Order";

export async function POST(request) {
  try {
    await dbConnect();

    const { order_id: orderId, status } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "order_id is required" }, { status: 400 });
    }

    const normalizedStatus = String(status || "").toLowerCase();
    const paymentStatus = normalizedStatus === "successful" ? "successful" : "failed";
    const orderStatus = paymentStatus === "successful" ? "processing" : "cancelled";

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus, orderStatus },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
