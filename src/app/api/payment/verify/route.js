// src/app/api/payment/verify/route.js

import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbconnect";
import Order from "../../../../../models/Order";
import Payment from "../../../../../models/Payment";

export async function GET(request) {
  await dbConnect();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const transactionId = url.searchParams.get("transaction_id");
  const orderId = url.searchParams.get("orderId");

  console.log("Redirected to verify endpoint.");
  console.log("URL Params:", { status, transactionId, orderId });

  if (!orderId || !transactionId) {
    console.error("Missing orderId or transactionId in URL params.");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/status?status=failed`);
  }

  try {
    let paymentStatus = "failed";
    let orderStatus = "cancelled";

    // CORRECTED: Check for 'completed' and 'successful' from URL
    if (status === "successful" || status === "completed") {
      console.log("Initial status is successful. Verifying transaction...");
      paymentStatus = "successful";
      orderStatus = "pending";
      
      const flutterRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
      });
      
      console.log("Flutterwave verification response status:", flutterRes.status);
      const flutterData = await flutterRes.json();
      console.log("Flutterwave verification response data:", JSON.stringify(flutterData, null, 2));
      
      // CRITICAL CHECK: Ensure both status fields from Flutterwave are successful
      if (flutterData.status === "success" && flutterData.data.status === "successful") {
        console.log("Payment verification succeeded.");
        await Payment.create({
          userId: (await Order.findById(orderId)).user,
          orderId: orderId,
          amount: flutterData.data.amount,
          paymentMethod: flutterData.data.payment_type,
          transactionId: transactionId,
          status: "successful",
        });
      } else {
        console.error("Payment verification failed based on Flutterwave's response.");
        paymentStatus = "failed";
        orderStatus = "cancelled";
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: paymentStatus, orderStatus: orderStatus },
      { new: true }
    );

    if (updatedOrder && paymentStatus === "successful") {
      console.log("Order updated successfully. Redirecting to successful status page.");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/status?status=successful`);
    } else {
      console.log("Payment failed. Redirecting to failed status page.");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/status?status=failed`);
    }

  } catch (error) {
    console.error("Payment verification error in catch block:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/status?status=failed`);
  }
}