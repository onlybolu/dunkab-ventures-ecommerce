import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "../../../../lib/dbconnect";
import Order from "../../../../models/Order";

const JWT_SECRET = process.env.JWT_SECRET;

const PAYMENT_STATUSES = new Set(["pending", "successful", "failed"]);
const ORDER_STATUSES = new Set(["pending", "processing", "dispatched", "being delivered", "delivered", "cancelled"]);
const METHODS = new Set(["delivery", "pickup"]);

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizePrice = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveOrderStatus = (paymentStatus) => {
  if (paymentStatus === "failed") return "cancelled";
  if (paymentStatus === "successful") return "processing";
  return "pending";
};

const getSessionUserId = async () => {
  if (!JWT_SECRET) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded?._id || decoded?.id || null;
  } catch {
    return null;
  }
};

export async function POST(request) {
  try {
    await dbConnect();

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      items,
      totalAmount,
      method,
      deliveryInfo = {},
      paymentStatus = "pending",
    } = body || {};

    if (userId && String(userId) !== String(sessionUserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order owner" },
        { status: 403 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const normalizedMethod = String(method || "").toLowerCase().trim();
    if (!METHODS.has(normalizedMethod)) {
      return NextResponse.json(
        { success: false, message: "Invalid order method" },
        { status: 400 }
      );
    }

    const normalizedPaymentStatus = String(paymentStatus || "pending").toLowerCase().trim();
    if (!PAYMENT_STATUSES.has(normalizedPaymentStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status" },
        { status: 400 }
      );
    }

    const cleanedItems = items.map((item) => {
      const quantity = Math.max(1, Math.floor(toNumber(item?.quantity, 1)));
      return {
        productId: item?.productId || item?._id,
        name: item?.name || item?.title || "Product",
        price: normalizePrice(item?.price),
        quantity,
        selectedColor: item?.selectedColor || item?.color || "",
        image: item?.image || "",
      };
    });

    const hasInvalidItem = cleanedItems.some((item) => !item.productId || item.price < 0 || item.quantity < 1);
    if (hasInvalidItem) {
      return NextResponse.json(
        { success: false, message: "One or more order items are invalid" },
        { status: 400 }
      );
    }

    const expectedSubtotal = cleanedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = normalizePrice(deliveryInfo?.shippingFee);
    const expectedTotal = normalizedMethod === "delivery" ? expectedSubtotal + shippingFee : expectedSubtotal;
    const payloadTotal = normalizePrice(totalAmount);

    if (!Number.isFinite(payloadTotal) || payloadTotal <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order total" },
        { status: 400 }
      );
    }

    if (Math.abs(payloadTotal - expectedTotal) > 1) {
      return NextResponse.json(
        { success: false, message: "Order total mismatch" },
        { status: 400 }
      );
    }

    const name = String(deliveryInfo?.name || "").trim();
    const email = String(deliveryInfo?.email || "").trim().toLowerCase();
    const phone = String(deliveryInfo?.phone || "").trim();
    const address = String(deliveryInfo?.address || "").trim();
    const state = String(deliveryInfo?.state || "").trim();
    const lga = String(deliveryInfo?.lga || "").trim();
    const isWithinLagos = String(deliveryInfo?.isWithinLagos || "").trim();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Delivery contact details are required" },
        { status: 400 }
      );
    }

    if (normalizedMethod === "delivery" && (!address || !state || !lga)) {
      return NextResponse.json(
        { success: false, message: "Complete delivery address is required" },
        { status: 400 }
      );
    }

    const order = await Order.create({
      user: sessionUserId,
      items: cleanedItems,
      method: normalizedMethod,
      deliveryInfo: {
        name,
        email,
        phone,
        address,
        shippingFee: shippingFee.toString(),
        isWithinLagos,
        state,
        lga,
      },
      totalAmount: payloadTotal,
      paymentStatus: normalizedPaymentStatus,
      orderStatus: resolveOrderStatus(normalizedPaymentStatus),
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Order POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Math.floor(toNumber(searchParams.get("page"), 1)));
    const limit = Math.min(50, Math.max(1, Math.floor(toNumber(searchParams.get("limit"), 10))));
    const paymentStatus = String(searchParams.get("paymentStatus") || "all").toLowerCase().trim();
    const orderStatus = String(searchParams.get("orderStatus") || "all").toLowerCase().trim();

    const query = { user: sessionUserId };
    if (paymentStatus !== "all" && PAYMENT_STATUSES.has(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }
    if (orderStatus !== "all" && ORDER_STATUSES.has(orderStatus)) {
      query.orderStatus = orderStatus;
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      page,
      limit,
      totalOrders,
      totalPages: Math.max(1, Math.ceil(totalOrders / limit)),
    });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
