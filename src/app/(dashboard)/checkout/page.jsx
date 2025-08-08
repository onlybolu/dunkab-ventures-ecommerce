"use client";

import { useCart } from "../../../../context/cartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { cartItems, removeFromCart } = useCart();
  const router = useRouter();
  const [loading, setLoading]= useState(false)

  const parsePrice = (priceStr) => parseFloat(priceStr.replace(/,/g, ""));
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parsePrice(item.price);
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = 2000;
  const total = subtotal + shippingFee;

  // 🧭 New: delivery method state
  const [method, setMethod] = useState("delivery"); // "delivery" or "pickup"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");
    
    if (method === "delivery") {
      const missing = Object.entries(formData).filter(([_, val]) => val.trim() === "");
      if (missing.length > 0) return alert("Please fill in all delivery details");
      localStorage.setItem("deliveryInfo", JSON.stringify(formData));
    }
  
    localStorage.setItem("orderMethod", method);
  
    const totalAmount = method === "delivery" ? total : subtotal;
  
    try {
      setLoading(true)
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount.toFixed(2),
          name: formData.name || "Anonymous",
          email: formData.email || "anonymous@example.com",
          phone: formData.phone || "08000000000",
        }),
      });
  
      const data = await res.json();
  
      if (data.link) {
        window.location.href = data.link; // Redirect to Flutterwave hosted page
        setLoading(false)
      } else {
        alert("Payment could not be initiated.");
        // console.error("Flutterwave error:", data);
        setLoading(false)
      }
    } catch (error) {
      alert("Something went wrong. Try again.");
      console.error("Checkout error:", error);
      setLoading(false)
    }
  };
  
  

  return (
    <div className="mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Delivery method switch */}
      <div className="mb-6 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="method"
            value="delivery"
            checked={method === "delivery"}
            onChange={() => setMethod("delivery")}
          />
          Delivery
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="method"
            value="pickup"
            checked={method === "pickup"}
            onChange={() => setMethod("pickup")}
          />
          Pickup
        </label>
      </div>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cart Summary */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const price = parsePrice(item.price);
                const totalPrice = price * item.quantity;

                return (
                  <div key={item._id} className="flex items-center gap-4 border-b pb-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="text-sm text-gray-500">
                        ₦{price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">₦{totalPrice.toLocaleString()}</p>
                    <button
                      className="text-red-500 hover:underline text-sm"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      fill="red"
                      className="bi bi-trash3"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                    </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              {method === "delivery" && (
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₦{shippingFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ₦{(method === "delivery" ? total : subtotal).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              className="bg-black text-white px-6 py-3 rounded w-full cursor-pointer hover:bg-gray-800"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "please wait........": "Continue with Payment"}
            </button>
          </div>

          {/* Delivery or Pickup Details */}
          <div className="md:w-1/2 space-y-6">
            {method === "delivery" ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Delivery Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pickup Location</h2>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="font-medium">Company Address:</p>
                  <p className="text-gray-700">
                    block N shop 57 & 58 also known as Pepsi building gorodomu, ebute ero market, lagos island
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Please arrive within 48 hours of placing your order. Pickup hours: 9AM - 7PM.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
