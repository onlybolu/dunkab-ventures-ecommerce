"use client";

import { useCart } from "../../../../context/cartContext"; // Corrected path
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../../components/Logo";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure Toastify CSS is imported

export default function CartPage() {
  // Destructure cart items, removal functions, and feedback states from useCart
  const { cartItems, removeFromCart, clearCart, feedbackMessage, isSavingCart } = useCart();
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState(null);
  const [fullCartItems, setFullCartItems] = useState([]);
  const router = useRouter();

  /**
   * Fetches full product details for each item in the cartItems array.
   * This useEffect runs whenever cartItems changes, ensuring the display is up-to-date.
   */
  useEffect(() => {
    async function fetchProducts() {
      // If cart is empty, clear fullCartItems and return
      if (!cartItems.length) {
        setFullCartItems([]);
        return;
      }

      try {
        const productsWithDetails = await Promise.all(
          cartItems.map(async (item) => {
            // CRITICAL FIX: Use item.productId to fetch product details from your API
            // The CartContext ensures that each item in cartItems will have 'productId'
            const res = await fetch(`/api/products/${item.productId}`);
            if (!res.ok) {
              console.error(`Failed to fetch product with ID: ${item.productId}`);
              // If a product fails to fetch, you might want to handle it gracefully,
              // e.g., return a placeholder or skip this item.
              throw new Error("Failed to fetch product details for a cart item.");
            }
            const product = await res.json();
            return {
              ...product, // Contains original product details like _id, image, title, price
              quantity: item.quantity, // Override with cart quantity
              color: item.color, // Preserve the color chosen by the user for this cart item
              cartItemId: item.id || item.productId // Use a unique identifier for the cart item itself if needed
            };
          })
        );
        setFullCartItems(productsWithDetails);
      } catch (error) {
        console.error("Error fetching product details for cart:", error);
        setFullCartItems([]); // Clear cart items on a fetch error
        toast.error("Error loading cart items. Please try again.");
      }
    }

    fetchProducts();
  }, [cartItems]); // Re-run this effect whenever cartItems changes in the context

  /**
   * Manages the "previous path" for the back link, storing it in sessionStorage.
   */
  useEffect(() => {
    const lastPath = sessionStorage.getItem("currentPath");
    if (lastPath) setPreviousPath(lastPath);
    sessionStorage.setItem("lastPath", pathname);
  }, [pathname]);

  /**
   * Formats a given path for display in the breadcrumbs.
   * @param {string} path - The URL path to format.
   * @returns {string} The formatted path.
   */
  const formatPathname = (path) => {
    if (path === "/") return "Home";
    return path
      .split("/")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" / ");
  };

  /**
   * Handles the checkout process, including user login check.
   */
  const handleCheckout = () => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) {
      toast.error("Please log in or create an account to checkout.");
      router.push("/authentication");
      return;
    }
  
    let user;
    try {
      user = JSON.parse(storedUser); // Correctly parse the JSON string from localStorage
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
      toast.error("Invalid user data. Please log in again.");
      localStorage.removeItem("user"); // Clear invalid data
      router.push("/authentication");
      return;
    }
  
    // Optional: Add more specific checks on the parsed user object if needed
    if (!user?._id) {
      toast.error("User data is incomplete. Please log in again.");
      router.push("/authentication");
      return;
    }

    router.push("/checkout");
  };

  return (
    <div className="">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="w-full relative">
        <Image
          src={"/productbg.png"}
          alt="Products"
          width={500}
          height={500}
          className="w-full h-100"
        />
        <div className="absolute top-0 left-0 w-full h-100 flex flex-col items-center justify-center bg-white/30 bg-opacity-50 text-white text-2xl font-bold">
          <div className=" flex items-center">
            {/* Using Link for Logo as it's common practice */}
            <Link href="/">
              <Logo width={"w-15"} height={"h-20"} hidden={"hidden"} fontSize={"text-2xl"} />
            </Link>
            {previousPath && (
              <Link
                href={previousPath}
                className="hover:underline text-3xl font-semibold text-gray-700"
              >
                {formatPathname(previousPath)}
              </Link>
            )}
          </div>
          <div className="text-gray-600 flex gap-2">
            <p className="font-medium">Home</p>
            <p className="font-bold text-black">{">"}</p>
            <p className="font-medium">Cart</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

        {/* Display feedback messages and saving status from CartContext */}
        {feedbackMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {feedbackMessage}
          </div>
        )}
        {isSavingCart && (
          <div className="text-center text-blue-600 mb-4">Saving cart...</div>
        )}

        {fullCartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {fullCartItems.map((item) => (
                <li
                  // Use a combination of product ID and color for a unique key
                  // This is important if the same product can be in different colors
                  key={`${item._id}-${item.color}`}
                  className="flex justify-between items-center shadow-xl p-4 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/product/${item._id}`}
                      className="flex items-center gap-4 hover:underline"
                    >
                      {/* Placeholder image if item.image is missing */}
                      <Image
                        src={item.image || `https://placehold.co/100x100/eeeeee/333333?text=No+Image`}
                        alt={item.title}
                        width={100}
                        height={100}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div>
                        <h2 className="font-semibold">{item.title}</h2>
                        <p>₦{item.price.toLocaleString()}</p>
                        <p>Qty: {item.quantity}</p>
                        {/* Display the color if it exists */}
                        {item.color && item.color !== "" && (
                          <p className="text-sm text-gray-500">Color: {item.color}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                  <button
                    // CRITICAL FIX: Pass both product ID and color to removeFromCart
                    onClick={() => removeFromCart(item._id, item.color)}
                    className="text-red-500 cursor-pointer p-2 rounded-full hover:bg-red-100 transition-colors"
                    aria-label={`Remove ${item.title} (${item.color || 'no color'}) from cart`}
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
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={clearCart}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>

              <button
                onClick={handleCheckout}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}

        <Link href="/products" className="block mt-6 text-blue-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

/* Image Swiper stays the same from your original code, assuming it's imported or defined elsewhere */
// If ImageSwiper is directly in this file, include it below this component.
// For brevity in this response, it's omitted but should be present in your actual file.
