"use client";

import { useCart } from "../../../../context/cartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { nigeriaStates } from "../../../../lib/nigeriaStatesAndLgas";

export default function CheckoutPage() {
  const { cartItems, user, loading: contextLoading } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("delivery");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
  const [isWithinLagos, setIsWithinLagos] = useState(true);
  const [selectedLGA, setSelectedLGA] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [lgasOfSelectedState, setLgasOfSelectedState] = useState([]);

  useEffect(() => {
    if (selectedState) {
      const stateData = nigeriaStates.find((s) => s.state === selectedState);
      setLgasOfSelectedState(stateData ? stateData.lgas : []);
      setSelectedLGA("");
    } else {
      setLgasOfSelectedState([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (!contextLoading && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [contextLoading, user]);

  const cleanPriceString = (priceString) => {
    if (typeof priceString === "number") return priceString;
    return parseFloat(String(priceString).replace(/[^0-9.]/g, "")) || 0;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + cleanPriceString(item.price) * item.quantity, 0);
  const shippingFee = method === "delivery" ? (isWithinLagos ? subtotal * 0.05 : subtotal * 0.1) : 0;
  const total = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    const { name, email, phone, address } = formData;
    if (!name || !email || !phone) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }

    if (method === "delivery") {
      if (!isWithinLagos && !selectedState) {
        toast.error("Please select a state for delivery.");
        return;
      }
      if (!selectedLGA) {
        toast.error("Please select your Local Government Area.");
        return;
      }
      if (!address) {
        toast.error("Please fill in the delivery address.");
        return;
      }
    }

    try {
      setLoading(true);

      const saveOrderRes = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          items: cartItems,
          method,
          deliveryInfo: {
            ...formData,
            shippingFee,
            isWithinLagos,
            state: isWithinLagos ? "Lagos" : selectedState,
            lga: selectedLGA,
          },
          totalAmount: method === "delivery" ? total : subtotal,
          paymentStatus: "pending",
          orderStatus: "pending",
        }),
      });

      const saveOrderData = await saveOrderRes.json();
      if (!saveOrderData.success) {
        toast.error("Could not save order. Please try again.");
        return;
      }

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: (method === "delivery" ? total : subtotal).toFixed(2),
          name,
          email,
          phone,
          orderId: saveOrderData.order._id,
        }),
      });

      const data = await res.json();
      if (data.link) {
        window.location.href = data.link;
      } else {
        toast.error("Payment could not be initiated. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  if (!user) {
    router.push("/authentication");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/30 to-white">
      <ToastContainer position="top-center" autoClose={3000} newestOnTop />

      <section className="border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <Link href="/productcart" className="hover:text-slate-900">Cart</Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Checkout</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Secure Checkout</h1>
          <p className="mt-2 text-slate-600">Complete your cooler order with delivery or pickup.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Order Method</h2>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup (Free)</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:col-span-2" />
            </div>
          </div>

          {method === "delivery" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Delivery Details</h2>

              <div className="space-y-4">
                <select
                  value={String(isWithinLagos)}
                  onChange={(e) => setIsWithinLagos(e.target.value === "true")}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="true">Within Lagos</option>
                  <option value="false">Outside Lagos</option>
                </select>

                {!isWithinLagos && (
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Select State</option>
                    {nigeriaStates.map((s) => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedLGA}
                  onChange={(e) => setSelectedLGA(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Select LGA</option>
                  {(isWithinLagos
                    ? nigeriaStates.find((s) => s.state === "Lagos")?.lgas || []
                    : lgasOfSelectedState
                  ).map((lga) => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full delivery address"
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
          )}

          {method === "pickup" && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-slate-900">Pickup Location</h2>
              <p className="text-slate-700">Block 'N' shop 57 & 58, Pepsi Building, Orodumu, Ebute Ero Market, Lagos Island, Nigeria.</p>
              <p className="mt-2 text-sm text-slate-600">Pickup hours: Monday - Saturday, 9:00 AM - 6:00 PM.</p>
            </div>
          )}
        </section>

        <aside className="lg:col-span-1">
          <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <h2 className="mb-4 border-b border-slate-200 pb-4 text-xl font-bold text-slate-900">Order Summary</h2>

            {cartItems.length === 0 ? (
              <p className="py-4 text-center text-slate-600">No items in cart</p>
            ) : (
              <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.image || "/placeholder-image.png"}
                        alt={item.title}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="max-w-[170px] whitespace-nowrap overflow-hidden text-ellipsis text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} {item.color ? `| Color: ${item.color}` : ""}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">₦{(cleanPriceString(item.price) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm">
              <p className="flex items-center justify-between text-slate-700">
                <span>Subtotal</span>
                <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
              </p>
              {method === "delivery" && (
                <p className="flex items-center justify-between text-slate-700">
                  <span>Shipping</span>
                  <span className="font-semibold">₦{shippingFee.toLocaleString()}</span>
                </p>
              )}
              <p className="flex items-center justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>₦{(method === "delivery" ? total : subtotal).toLocaleString()}</span>
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="mt-6 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
