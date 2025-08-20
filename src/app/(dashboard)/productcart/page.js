"use client";

import { useCart } from "../../../../context/cartContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, feedbackMessage, isSavingCart, user } = useCart();
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState(null);
  const [fullCartItems, setFullCartItems] = useState([]);
  const [loading, setLoading] = useState(true); // New state for loading status
  const router = useRouter();

  const cleanPriceString = (priceString) => {
    if (typeof priceString === 'number') {
      return priceString;
    }
    const cleanedString = String(priceString).replace(/[^0-9.]/g, '');
    return parseFloat(cleanedString) || 0;
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true); // Set loading to true at the start of the fetch
      if (!cartItems.length) {
        setFullCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const productsWithDetails = await Promise.all(
          cartItems.map(async (item) => {
            const res = await fetch(`/api/products/${item.productId}`);
            if (!res.ok) {
              console.error(`Failed to fetch product with ID: ${item.productId}`);
              throw new Error("Failed to fetch product details for a cart item.");
            }
            const product = await res.json();
            return {
              ...product,
              quantity: item.quantity,
              color: item.color,
              cartItemId: item.id || item.productId,
            };
          })
        );
        setFullCartItems(productsWithDetails);
      } catch (error) {
        console.error("Error fetching product details for cart:", error);
        setFullCartItems([]);
        toast.error("Error loading cart items. Please try again.");
      } finally {
        setLoading(false); // Set loading to false after the fetch is complete (success or failure)
      }
    }

    fetchProducts();
  }, [cartItems]);

  useEffect(() => {
    const lastPath = sessionStorage.getItem("currentPath");
    if (lastPath) setPreviousPath(lastPath);
    sessionStorage.setItem("lastPath", pathname);
  }, [pathname]);

  const formatPathname = (path) => {
    if (path === "/") return "Home";
    return path
      .split("/")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" / ");
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please log in to proceed to checkout. Redirecting you now.");
      router.push("/authentication");
      return;
    }

    router.push("/checkout");
  };

  const subtotal = fullCartItems.reduce(
    (acc, item) => acc + (cleanPriceString(item.price) * item.quantity), 0
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} newestOnTop={true} />

      <div className="bg-white py-8 md:py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-700">Cart</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Your Shopping Cart ({fullCartItems.length})
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {feedbackMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
            {feedbackMessage}
          </div>
        )}
        {isSavingCart && (
          <div className="text-center text-blue-600 mb-4 font-medium">
            Updating your cart...
          </div>
        )}

        {/* Conditional rendering based on loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : fullCartItems.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-xl font-medium">Your cart is currently empty.</p>
            <Link href="/products" className="mt-6 inline-block text-blue-600 font-semibold hover:underline transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {fullCartItems.map((item) => (
                <div key={`${item._id}-${item.color}`} className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-6">
                  <Link href={`/product/${item._id}`} className="flex-shrink-0">
                    <Image
                      src={item.image || `/placeholder-image.png`}
                      alt={item.title}
                      width={120}
                      height={120}
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </Link>
                  <div className="flex-grow">
                    <Link href={`/product/${item._id}`} className="hover:text-blue-600 transition-colors">
                      <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.color && item.color !== "" && `Color: ${item.color}`}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ₦{(cleanPriceString(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item._id, item.color)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.53Zm-3.13 0a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0v-8.5a.5.5 0 0 0-.5-.5Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {/* <button onClick={() => clearCart()}>clear cart</button> */}
            </div>

            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md sticky top-28 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">Order Summary</h2>
              <div className="flex justify-between items-center mb-4 text-gray-700">
                <span>Subtotal ({fullCartItems.length} items)</span>
                <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-gray-700">
                <span>Shipping Fee</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4 text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
              <Link href="/products" className="block text-center mt-4 text-sm text-blue-600 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}