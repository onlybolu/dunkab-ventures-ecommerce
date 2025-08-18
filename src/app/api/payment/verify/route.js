// src/app/api/payment/verify/route.js

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "../../../../../lib/dbconnect";
import Order from "../../../../../models/Order";
import Payment from "../../../../../models/Payment";

export async function GET(request) {
  await dbConnect();
  
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");
  const baseUrl = `${protocol}://${host}`;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const transactionId = url.searchParams.get("transaction_id");
  const orderId = url.searchParams.get("orderId");

  console.log("Redirected to verify endpoint.");
  console.log("URL Params:", { status, transactionId, orderId });

  if (!orderId || !transactionId) {
    console.error("Missing orderId or transactionId in URL params.");
    return NextResponse.redirect(`${baseUrl}/status?status=failed`);
  }

  // CRITICAL FIX: Initialize with 'failed' and 'cancelled'
  let paymentStatus = "failed";
  let orderStatus = "cancelled";

  try {
    // Only proceed with Flutterwave verification if the URL status is successful
    if (status === "successful" || status === "completed") {
      console.log("Initial status is successful. Verifying transaction...");

      const flutterRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
      });

      console.log("Flutterwave verification response status:", flutterRes.status);
      const flutterData = await flutterRes.json();
      console.log("Flutterwave verification response data:", JSON.stringify(flutterData, null, 2));

      // CRITICAL CHECK: Confirm both Flutterwave statuses are successful
      if (flutterData.status === "success" && flutterData.data.status === "successful") {
        console.log("Payment verification succeeded.");
        paymentStatus = "successful";
        orderStatus = "pending";

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
        // The variables remain "failed" and "cancelled" as they were initialized
      }
    }
    
    // FIX: This update call is now outside the 'if' block to ensure it always runs.
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: paymentStatus, orderStatus: orderStatus },
      { new: true }
    );

    if (updatedOrder && paymentStatus === "successful") {
      console.log("Order updated successfully. Redirecting to successful status page.");
      return NextResponse.redirect(`${baseUrl}/status?status=successful`);
    } else {
      console.log("Payment failed. Redirecting to failed status page.");
      return NextResponse.redirect(`${baseUrl}/status?status=failed`);
    }

  } catch (error) {
    console.error("Payment verification error in catch block:", error);
    // CRITICAL FIX: Update order status to "failed" even if a network or server error occurs
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed", orderStatus: "cancelled" });
    return NextResponse.redirect(`${baseUrl}/status?status=failed`);
  }
}