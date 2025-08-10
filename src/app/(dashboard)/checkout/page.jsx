"use client";

import { useCart } from "../../../../context/cartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [method, setMethod] = useState("delivery");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser =
      storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

    if (parsedUser) {
      setUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
      }));
    }
  }, []);

  const parsePrice = (priceStr) => parseFloat(priceStr.replace(/,/g, ""));
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );
  const shippingFee = 2000;
  const total = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");
  
    if (method === "delivery") {
      const missing = Object.entries(formData).filter(
        ([_, val]) => val.trim() === ""
      );
      if (missing.length > 0)
        return alert("Please fill in all delivery details");
      localStorage.setItem("deliveryInfo", JSON.stringify(formData));
    }
  
    localStorage.setItem("orderMethod", method);
    const totalAmount = method === "delivery" ? total : subtotal;
  
    try {
      setLoading(true);
  
      // Save order first
      const saveOrderRes = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || null,
          items: cartItems,
          method,
          deliveryInfo: formData,
          totalAmount,
          paymentStatus: "pending",
          orderStatus: "pending" // explicit initial state
        }),
      });
  
      const saveOrderData = await saveOrderRes.json();
      if (!saveOrderData.success) {
        alert("Could not save order. Please try again.");
        return;
      }
  
      // Continue to payment
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount.toFixed(2),
          name: formData.name || user?.name,
          email: formData.email || user?.email || "anonymous@mail.com",
          phone: formData.phone || "08000000000",
        }),
      });
  
      const data = await res.json();
      if (data.link) {
        localStorage.setItem("awaitingPayment", "true");
        window.location.href = data.link;
      } else {
        // If payment init fails → update order to failed/cancelled
        await fetch(`/api/order/${saveOrderData.order._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: "failed",
            orderStatus: "cancelled"
          }),
        });
        alert("Payment could not be initiated. Order cancelled.");
      }
    } catch (error) {
      alert("Something went wrong. Try again.");
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };
  

  // Payment success handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const status = url.searchParams.get("status");

      if (status === "successful" && localStorage.getItem("awaitingPayment")) {
        clearCart();
        localStorage.removeItem("awaitingPayment");
        localStorage.removeItem("cartItems");
        router.replace("/checkout");
      }
    }
  }, [clearCart, router]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Method Selection */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block font-semibold mb-2">Order Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="border p-3 rounded w-full outline-none"
            >
              <option value="delivery">Delivery (₦2,000 shipping)</option>
              <option value="pickup">Pickup (Free)</option>
            </select>
          </div>

          {/* Delivery Info */}
          {method === "delivery" && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-4">Delivery Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["name", "email", "phone", "address"].map((field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field]}
                    onChange={handleChange}
                    className="border p-3 rounded w-full outline-none col-span-1 sm:col-span-2"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pickup Info */}
          {method === "pickup" && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-4">Pickup Location</h2>
              <p className="text-gray-700">
                📍 123 Main Street, Lagos, Nigeria <br />
                🕒 Monday – Saturday, 9:00 AM – 6:00 PM
              </p>
            </div>
          )}
        </div>

        {/* Right: Cart Summary */}
        <div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold mb-4">Your Order</h2>
            <div className="divide-y">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded border"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ₦{item.price}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    ₦
                    {(
                      parsePrice(item.price) * item.quantity
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 border-t pt-4 space-y-2">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </p>
              {method === "delivery" && (
                <p className="flex justify-between">
                  <span>Shipping</span>
                  <span>₦{shippingFee.toLocaleString()}</span>
                </p>
              )}
              <p className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ₦
                  {(method === "delivery" ? total : subtotal).toLocaleString()}
                </span>
              </p>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
