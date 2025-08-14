"use client";
import { createContext, useContext, useState, useEffect } from "react";

// Create the CartContext
const CartContext = createContext();

/**
 * CartProvider component that manages the cart state and provides it to its children.
 * It handles adding, removing, and clearing items from the cart,
 * as well as synchronizing the cart with a backend database.
 * @param {object} { children } - React children to be rendered within the context.
 */
export function CartProvider({ children }) {
  // State to hold the current cart items
  const [cartItems, setCartItems] = useState([]);
  // State to hold the authenticated user information
  const [user, setUser] = useState(null);
  // State for user feedback messages (e.g., "Please log in")
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  // State to indicate if a cart operation is in progress (optional, for UI loading states)
  const [isSavingCart, setIsSavingCart] = useState(false);

  /**
   * Fetches the user's cart from the database.
   * @param {string} userId - The ID of the current user.
   */
  const fetchCartFromDB = async (userId) => {
    if (!userId) {
      setCartItems([]);
      return;
    }
    try {
      const cartRes = await fetch(`/api/cart/${userId}`, {
        cache: "no-store", // Ensure fresh data
        credentials: "include", // Include cookies for session
      });
      if (cartRes.ok) {
        const data = await cartRes.json();
        // Normalize fetched cart items: ensure 'productId' is always present
        // If your backend stores it as '_id', map it to 'productId' here.
        const normalizedCart = (data.cart || []).map(item => ({
          ...item,
          productId: item.productId || item._id, // Use existing productId, or map from _id
          // Ensure color is normalized here too if it comes from DB unnormalized
          color: item.color ? item.color.toLowerCase().trim() : ""
        }));
        setCartItems(normalizedCart);
      } else {
        // If fetch fails or no cart is found, initialize with an empty array
        setCartItems([]);
        console.error("Failed to fetch cart:", cartRes.statusText);
      }
    } catch (err) {
      console.error("Error fetching updated cart:", err);
      setCartItems([]); // Ensure cart is empty on error
    }
  };

  /**
   * Effect hook to check user session and fetch cart data.
   * Runs on component mount and periodically every 5 seconds.
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          // If session is not OK (e.g., user logged out), clear user and cart
          if (user !== null) {
            setUser(null);
            // This is the specific line that clears locally without saving to DB
            setCartItems([]);
          }
          return;
        }

        const { user: loggedInUser } = await res.json();

        // Update user state only if it has changed
        if (!user || user._id !== loggedInUser._id) {
          setUser(loggedInUser);
          await fetchCartFromDB(loggedInUser._id);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        // Optionally, clear user and cart on session check error
        setUser(null);
        setCartItems([]);
      }
    };

    // Initial session check
    checkSession();
    // Set up interval for periodic session checks
    const interval = setInterval(checkSession, 5000);
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [user]); // Dependency on 'user' to re-run when user changes

  /**
   * Saves the current cart items to the database.
   * @param {Array} newCart - The array of cart items to save.
   */
  const saveCartToDB = async (newCart) => {
    if (!user?._id) {
      // Don't save if no user is logged in
      console.warn("No user logged in, cart not saved to DB.");
      return;
    }
    setIsSavingCart(true); // Indicate saving is in progress
    try {
      await fetch("/api/cart/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, cart: newCart }),
      });
    } catch (err) {
      console.error("Error saving cart:", err);
      setFeedbackMessage("Failed to update cart. Please try again.");
      setTimeout(() => setFeedbackMessage(null), 3000);
    } finally {
      setIsSavingCart(false); // Saving complete
    }
  };

  /**
   * Adds a product to the cart. If the product (with the same color) already exists,
   * its quantity is updated; otherwise, a new item is added.
   * @param {object} product - The product object to add. Must have _id, title, price.
   * @param {string} selectedColor - The chosen color of the product.
   */
  const addToCart = (product, selectedColor) => {
    if (!user?._id) {
      setFeedbackMessage("Please log in to add items to your cart.");
      setTimeout(() => setFeedbackMessage(null), 3000); // Clear message after 3 seconds
      return;
    }

    // Normalize selected color for consistent comparison and storage
    const normalizedColor = selectedColor ? selectedColor.toLowerCase().trim() : "";

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.productId === product._id && item.color === normalizedColor // Compare with normalized color
      );

      let newCart;
      if (existingItemIndex > -1) {
        // If item exists, update its quantity
        newCart = prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        // If item doesn't exist, add it as a new item
        newCart = [
          ...prevItems,
          {
            productId: product._id,
            title: product.title,
            price: product.price,
            color: normalizedColor, // Store normalized color
            quantity: product.quantity || 1, // Default to 1 if not specified
          },
        ];
      }
      saveCartToDB(newCart); // Save updated cart to DB asynchronously
      return newCart; // Return new cart to update state immediately
    });
  };

  /**
   * Removes a specific product variation from the cart.
   * @param {string} productId - The ID of the product to remove.
   * @param {string} color - The color of the product variation to remove.
   */
  const removeFromCart = (productId, color) => {
    // Normalize color for consistent removal logic
    const normalizedColor = color ? color.toLowerCase().trim() : "";

    setCartItems((prevItems) => {
      // Filter out the item that matches both productId AND normalizedColor
      const newCart = prevItems.filter(
        (item) => !(item.productId === productId && item.color === normalizedColor)
      );
      saveCartToDB(newCart); // Save updated cart to DB asynchronously
      return newCart; // Return new cart to update state immediately
    });
  };

  /**
   * Clears all items from the cart both locally and in the database.
   */
  const clearCart = () => {
    setCartItems([]); // Clear state immediately
    saveCartToDB([]); // Save empty cart to DB asynchronously
  };

  /**
   * Clears all items from the cart only locally, without affecting the database.
   * Useful for logout scenarios where cart persistence in DB is desired.
   */
  const clearCartLocalOnly = () => {
    setCartItems([]); // Only clear local state
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        clearCartLocalOnly, // <-- NEW: Provide the local-only clear function
        feedbackMessage, // Provide feedback message for UI display
        isSavingCart, // Provide saving status for UI feedback
        user // Optionally provide user state if needed elsewhere in context consumers
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to easily consume the CartContext.
 * @returns {object} The cart context value (cartItems, addToCart, removeFromCart, clearCart, clearCartLocalOnly, feedbackMessage, isSavingCart, user).
 */
export const useCart = () => useContext(CartContext);
