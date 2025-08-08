// src/app/api/payment/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const payload = {
    tx_ref: Date.now().toString(),
    amount: body.amount,
    currency: "NGN",
    redirect_url: "http://dunkabventures.com/", // Change to your deployed URL
    customer: {
      email: body.email,
      name: body.name,
    },
    payment_options: "card,banktransfer",
    customizations: {
      title: "DUNKAB",
      description: "Product payment",
      logo: "https://dunkabventures.com/logo.png", // Optional
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
