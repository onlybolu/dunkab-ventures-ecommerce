"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../../../context/cartContext";

const PAGE_SIZE = 8;

const paymentTabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Successful", value: "successful" },
  { label: "Failed", value: "failed" },
];

const formatCurrency = (value) => {
  const parsed =
    typeof value === "number"
      ? value
      : parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  const amount = Number.isFinite(parsed) ? parsed : 0;
  return `₦${amount.toLocaleString()}`;
};

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

const statusBadgeClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "successful" || normalized === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "failed" || normalized === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  if (normalized === "processing" || normalized === "dispatched" || normalized === "being delivered") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async (signal) => {
    if (!user?._id) {
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);

      const res = await fetch(`/api/order?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
        signal,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch orders");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalOrders(Number(data.totalOrders) || 0);
      setTotalPages(Math.max(1, Number(data.totalPages) || 1));
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Orders fetch error:", err);
      setError(err?.message || "Failed to load orders");
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [authLoading, user?._id, page, paymentStatus]);

  useEffect(() => {
    setPage(1);
  }, [paymentStatus]);

  const orderSummary = useMemo(() => {
    return {
      pending: orders.filter((o) => o.paymentStatus === "pending").length,
      successful: orders.filter((o) => o.paymentStatus === "successful").length,
      failed: orders.filter((o) => o.paymentStatus === "failed").length,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/30 to-white">
      <section className="border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Orders</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">My Orders</h1>
          <p className="mt-2 text-slate-600">Track status, payment outcomes, and all purchased items.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {authLoading ? (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Guest Mode</h2>
            <p className="mt-2 text-slate-600">You need to log in to view your orders.</p>
            <Link
              href="/authentication"
              className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-sky-700"
            >
              Log In
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Orders</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{totalOrders}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Pending</p>
                <p className="mt-1 text-2xl font-bold text-amber-900">{orderSummary.pending}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Successful</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">{orderSummary.successful}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">Failed</p>
                <p className="mt-1 text-2xl font-bold text-rose-900">{orderSummary.failed}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {paymentTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setPaymentStatus(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    paymentStatus === tab.value
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                <p>{error}</p>
                <button
                  onClick={() => fetchOrders()}
                  className="mt-2 text-sm font-semibold text-rose-800 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <h3 className="text-2xl font-bold text-slate-900">No Orders Yet</h3>
                <p className="mt-2 text-slate-600">Shop products to place your first order and track it here.</p>
                <Link
                  href="/products"
                  className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-sky-700"
                >
                  Shop Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Order #{String(order._id).slice(-8).toUpperCase()}</h2>
                        <p className="text-sm text-slate-500">Placed {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(order.paymentStatus)}`}>
                          Payment: {order.paymentStatus || "pending"}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(order.orderStatus)}`}>
                          Delivery: {order.orderStatus || "pending"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {(order.items || []).map((item, index) => (
                        <div key={`${item.productId || "item"}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{item.name || "Product"}</p>
                            <p className="text-xs text-slate-500">
                              Qty {item.quantity || 1}
                              {item.selectedColor ? ` • Color: ${item.selectedColor}` : ""}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{order.method || "delivery"}</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </article>
                ))}

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
