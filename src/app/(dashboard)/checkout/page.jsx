"use client";

import { useCart } from "../../../../context/cartContext";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { nigeriaStates } from "../../../../lib/nigeriaStatesAndLgas";

export default function CheckoutPage() {
  const { cartItems, clearCart, user, loading: contextLoading } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("delivery");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isWithinLagos, setIsWithinLagos] = useState(true);
  const [selectedLGA, setSelectedLGA] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [lgasOfSelectedState, setLgasOfSelectedState] = useState([]);
  const [previousPath, setPreviousPath] = useState(null);

  useEffect(() => {
    if (selectedState) {
      const stateData = nigeriaStates.find(s => s.state === selectedState);
      setLgasOfSelectedState(stateData ? stateData.lgas : []);
      setSelectedLGA('');
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
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
  }, [contextLoading, user]);

  useEffect(() => {
    const lastPath = sessionStorage.getItem("currentPath");
    if (lastPath) setPreviousPath(lastPath);
    sessionStorage.setItem("lastPath", pathname);
  }, [pathname]);

  const cleanPriceString = (priceString) => {
    if (typeof priceString === 'number') {
      return priceString;
    }
    const cleanedString = String(priceString).replace(/[^0-9.]/g, '');
    return parseFloat(cleanedString) || 0;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + cleanPriceString(item.price) * item.quantity,
    0
  );

  const shippingFee = isWithinLagos ? (subtotal * 0.05) : (subtotal * 0.10);

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
    
    if (method === "delivery") {
      if (!isWithinLagos && !selectedState) {
          toast.error("Please select a state for delivery.");
          return;
      }
      if (!selectedLGA) {
          toast.error("Please select your Local Government Area.");
          return;
      }
      if (!name || !email || !phone || !address) {
        toast.error("Please fill in all delivery details: name, email, phone, and address.");
        return;
      }
    }

    const totalAmount = method === "delivery" ? total : subtotal;

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
            shippingFee: shippingFee,
            isWithinLagos: isWithinLagos,
            state: isWithinLagos ? 'Lagos' : selectedState,
            lga: selectedLGA,
          },
          totalAmount,
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
          amount: totalAmount.toFixed(2),
          name: name,
          email: email,
          phone: phone || user.phone,
          orderId: saveOrderData.order._id,
        }),
      });

      const data = await res.json();
      if (data.link) {
        window.location.href = data.link;
      } else {
        await fetch(`/api/order/${saveOrderData.order._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: "failed", orderStatus: "cancelled" }),
        });
        toast.error("Payment could not be initiated. Order cancelled.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This useEffect is now for redirecting from an old flow, can be left blank or removed after confirming it's not needed.
    // The new payment flow doesn't use this, as it redirects to the server's verify endpoint.
    // I will leave it blank for now to prevent any unintended behavior.
  }, []);

  if (contextLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  if (!user) {
    router.push("/authentication");
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} newestOnTop={true} />

      <div className="bg-white py-8 md:py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/productcart" className="hover:text-gray-700 transition-colors">Cart</Link>
            <span className="text-400">/</span>
            <span className="font-semibold text-gray-700">Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Proceed to Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Order Method</h2>
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                >
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup (Free)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {method === "delivery" && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Location
                      </label>
                      <select
                          id="location"
                          value={isWithinLagos}
                          onChange={(e) => setIsWithinLagos(e.target.value === 'true')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                          <option value="true">Within Lagos (5% of total price)</option>
                          <option value="false">Outside Lagos (10% of total price)</option>
                      </select>
                  </div>
                  {isWithinLagos ? (
                    <div className="col-span-1 sm:col-span-2">
                        <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-1">
                            Local Government Area (LGA)
                        </label>
                        <select
                            id="lga"
                            value={selectedLGA}
                            onChange={(e) => setSelectedLGA(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                        >
                            <option value="">Select an LGA</option>
                            {nigeriaStates.find(s => s.state === 'Lagos')?.lgas.map((lga) => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                    </div>
                  ) : (
                    <>
                      <div className="col-span-1 sm:col-span-2">
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                              State
                          </label>
                          <select
                              id="state"
                              value={selectedState}
                              onChange={(e) => setSelectedState(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              required
                          >
                              <option value="">Select a State</option>
                              {nigeriaStates.map((s) => (
                                  <option key={s.state} value={s.state}>{s.state}</option>
                              ))}
                          </select>
                      </div>
                      {selectedState && (
                          <div className="col-span-1 sm:col-span-2">
                              <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-1">
                                  Local Government Area (LGA)
                              </label>
                              <select
                                  id="lga"
                                  value={selectedLGA}
                                  onChange={(e) => setSelectedLGA(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  required
                              >
                                  <option value="">Select an LGA</option>
                                  {nigeriaStates.find(s => s.state === selectedState)?.lgas.map((lga) => (
                                      <option key={lga} value={lga}>{lga}</option>
                                  ))}
                              </select>
                          </div>
                      )}
                    </>
                  )}
                  <div className="col-span-1 sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      id="address"
                      name="address"
                      placeholder="Enter full delivery address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {method === "pickup" && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pickup Location Details</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="flex items-center text-gray-800 mb-2">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 110-4 2 2 0 010 4z" clipRule="evenodd"></path></svg>
                    <span className="font-semibold">Main Office:</span> 123 Main Street, Lagos, Nigeria
                  </p>
                  <p className="flex items-center text-gray-800">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
                    <span className="font-semibold">Hours:</span> Monday – Saturday, 9:00 AM – 6:00 PM
                  </p>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  Please pick up your order within 3 business days of confirmation.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-28 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">Your Order</h2>
              {cartItems.length === 0 ? (
                 <p className="text-gray-600 text-center py-4">No items in cart</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}`}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.image || `/placeholder-image.png`}
                          alt={item.title}
                          width={60}
                          height={60}
                          className="rounded-md border border-gray-200 object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} | {item.color && `Color: ${item.color}`}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₦{(cleanPriceString(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                <p className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                </p>
                {method === "delivery" && (
                  <p className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      ₦{shippingFee.toLocaleString()}
                    </span>
                  </p>
                )}
                <p className="flex justify-between font-bold text-xl text-gray-900">
                  <span>Total</span>
                  <span>
                    ₦{(method === "delivery" ? total : subtotal).toLocaleString()}
                  </span>
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}