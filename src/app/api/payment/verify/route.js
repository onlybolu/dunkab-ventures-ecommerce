import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "../../../../../lib/dbconnect";
import Order from "../../../../../models/Order";
import Payment from "../../../../../models/Payment";
import User from "../../../../../models/user";

const SUCCESS_STATUSES = new Set(["successful", "completed"]);

const getBaseUrl = async () => {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");
  return `${protocol}://${host}`;
};

const redirectWithStatus = (baseUrl, status, orderId) => {
  const params = new URLSearchParams({ status });
  if (orderId) params.set("orderId", String(orderId));
  return NextResponse.redirect(`${baseUrl}/status?${params.toString()}`);
};

const verifyFlutterwaveTransaction = async (transactionId) => {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey || !transactionId) return null;

  const flutterRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    }
  );

  const data = await flutterRes.json().catch(() => null);
  if (!flutterRes.ok || !data) return null;

  return data;
};

export async function GET(request) {
  await dbConnect();

  const baseUrl = await getBaseUrl();
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const status = String(url.searchParams.get("status") || "").toLowerCase();
  const transactionId = url.searchParams.get("transaction_id");

  if (!orderId) {
    return redirectWithStatus(baseUrl, "failed", null);
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return redirectWithStatus(baseUrl, "failed", orderId);
    }

    // Idempotency: don't downgrade already successful payments.
    if (order.paymentStatus === "successful") {
      return redirectWithStatus(baseUrl, "successful", orderId);
    }

    let paymentStatus = "failed";
    let orderStatus = "cancelled";
    let paymentMethod = "unknown";
    let paidAmount = Number(order.totalAmount) || 0;
    let finalTransactionId = transactionId || `failed-${orderId}-${Date.now()}`;

    if (SUCCESS_STATUSES.has(status) && transactionId) {
      const flutterData = await verifyFlutterwaveTransaction(transactionId);
      const gatewayStatus = flutterData?.data?.status;
      const gatewayCurrency = flutterData?.data?.currency;
      const gatewayAmount = Number(flutterData?.data?.amount || 0);
      const isGatewaySuccess =
        flutterData?.status === "success" &&
        gatewayStatus === "successful" &&
        gatewayCurrency === "NGN";

      if (isGatewaySuccess) {
        paymentStatus = "successful";
        orderStatus = "processing";
        paymentMethod = flutterData?.data?.payment_type || "card";
        paidAmount = Number.isFinite(gatewayAmount) && gatewayAmount > 0 ? gatewayAmount : paidAmount;
        finalTransactionId = transactionId;
      }
    }

    await Order.findByIdAndUpdate(orderId, { paymentStatus, orderStatus, paymentMethod }, { new: true });

    await Payment.findOneAndUpdate(
      { orderId },
      {
        $set: {
          userId: order.user,
          amount: paidAmount,
          paymentMethod,
          transactionId: finalTransactionId,
          status: paymentStatus,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (paymentStatus === "successful") {
      await User.findByIdAndUpdate(order.user, { $set: { cart: [] } }, { new: false });
      return redirectWithStatus(baseUrl, "successful", orderId);
    }

    return redirectWithStatus(baseUrl, "failed", orderId);
  } catch (error) {
    console.error("Payment verification error:", error);

    try {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed", orderStatus: "cancelled" });
    } catch (innerError) {
      console.error("Payment verification fallback update failed:", innerError);
    }

    return redirectWithStatus(baseUrl, "failed", orderId);
  }
}
