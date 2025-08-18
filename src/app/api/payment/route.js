// src/app/api/payment/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const baseUrl = "http://dunkabventures.com";

  if (!baseUrl) {
    return NextResponse.json({ error: "Base URL is not configured." }, { status: 500 });
  }

  const payload = {
    tx_ref: Date.now().toString(),
    amount: body.amount,
    currency: "NGN",
    // CRITICAL FIX: The redirect URL must point to the root /api folder.
    redirect_url: `${baseUrl}/api/payment/verify?orderId=${body.orderId}`,
    customer: {
      email: body.email,
      name: body.name,
    },
    payment_options: "card,banktransfer",
    customizations: {
      title: "DUNKAB",
      description: "Product payment",
      // FIX: Use a root-relative path for the logo
      logo: `${baseUrl}/logo.png`,
    },
  };

  try {
    const flutterRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await flutterRes.json();

    if (result.status === "success") {
      return NextResponse.json({ link: result.data.link });
    } else {
      return NextResponse.json({ error: "Flutterwave error", details: result }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }
}