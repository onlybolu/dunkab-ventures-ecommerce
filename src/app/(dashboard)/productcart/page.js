"use client";

import { useCart } from "../../../../context/cartContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, isSavingCart, user } = useCart();
  const [fullCartItems, setFullCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const cleanPriceString = (priceString) => {
    if (typeof priceString === "number") return priceString;
    const cleanedString = String(priceString).replace(/[^0-9.]/g, "");
    return parseFloat(cleanedString) || 0;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      if (!cartItems.length) {
        setFullCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const productsWithDetails = await Promise.all(
          cartItems.map(async (item) => {
            const res = await fetch(`/api/products/${item.productId}`);
            if (!res.ok) throw new Error(`Failed to fetch product ${item.productId}`);
            const product = await res.json();
            return {
              ...product,
              quantity: item.quantity,
              color: item.color || "",
              cartItemId: item.id || item.productId,
            };
          })
        );

        setFullCartItems(productsWithDetails);
      } catch (error) {
        console.error("Error fetching cart product details:", error);
        setFullCartItems([]);
        toast.error("Error loading cart items. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cartItems]);

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please log in to proceed to checkout.");
      router.push("/authentication");
      return;
    }
    router.push("/checkout");
  };

  const subtotal = fullCartItems.reduce((acc, item) => acc + cleanPriceString(item.price) * item.quantity, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/30 to-white">
      <ToastContainer position="top-center" autoClose={3000} newestOnTop />

      <section className="border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Cart</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Your Cooler Cart ({fullCartItems.length})</h1>
          <p className="mt-2 text-slate-600">Review items, adjust quantity, and proceed to secure checkout.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isSavingCart && <p className="mb-4 text-sm font-medium text-sky-700">Updating your cart...</p>}

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
          </div>
        ) : fullCartItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800">Your cart is empty</h2>
            <p className="mt-2 text-slate-600">Explore our latest coolers and add products to continue.</p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-sky-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              {fullCartItems.map((item) => (
                <article
                  key={`${item._id}-${item.color}`}
                  className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
                >
                  <Link href={`/product/${item._id}`} className="mx-auto sm:mx-0">
                    <Image
                      src={item.image || "/placeholder-image.png"}
                      alt={item.title}
                      width={120}
                      height={120}
                      className="h-28 w-28 rounded-xl border border-slate-200 object-cover"
                    />
                  </Link>

                  <div>
                    <Link href={`/product/${item._id}`} className="text-lg font-semibold text-slate-900 hover:text-sky-700">
                      {item.title}
                    </Link>
                    {item.color ? <p className="mt-1 text-sm text-slate-500">Color: {item.color}</p> : null}
                    <p className="mt-2 text-sm text-slate-500">Unit price: ₦{cleanPriceString(item.price).toLocaleString()}</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">₦{(cleanPriceString(item.price) * item.quantity).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center rounded-full border border-slate-300 bg-white px-2 py-1">
                      <button
                        className="rounded-full px-2 py-1 text-slate-700 hover:bg-slate-100"
                        onClick={() => updateQuantity(item._id, item.color, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        className="rounded-full px-2 py-1 text-slate-700 hover:bg-slate-100"
                        onClick={() => updateQuantity(item._id, item.color, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id, item.color)}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
                <h2 className="mb-4 border-b border-slate-200 pb-4 text-xl font-bold text-slate-900">Order Summary</h2>
                <div className="space-y-3 text-sm text-slate-700">
                  <p className="flex items-center justify-between">
                    <span>Items ({fullCartItems.length})</span>
                    <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </p>
                </div>
                <div className="mt-5 border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
                  <p className="flex items-center justify-between">
                    <span>Total</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="mt-6 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-sky-700"
                >
                  Proceed to Checkout
                </button>
                <Link href="/products" className="mt-4 block text-center text-sm font-semibold text-sky-700 hover:text-sky-900">
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
