"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

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
  // New: State to indicate if the initial context data (user, cart) is loading
  const [loading, setLoading] = useState(true);

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
        const normalizedCart = (data.cart || []).map(item => ({
          ...item,
          productId: item.productId || item._id,
          color: item.color ? item.color.toLowerCase().trim() : ""
        }));
        setCartItems(normalizedCart);
      } else {
        setCartItems([]);
        console.error("Failed to fetch cart:", cartRes.statusText);
      }
    } catch (err) {
      console.error("Error fetching updated cart:", err);
      setCartItems([]);
    }
  };

  /**
   * New: Function to load the user and cart from sessionStorage.
   * This is a useCallback to prevent unnecessary re-creations.
   */
  const loadInitialData = useCallback(async () => {
    try {
      // First, attempt to get user from session storage
      const storedUser = sessionStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // If user found, fetch their cart from DB
        await fetchCartFromDB(parsedUser._id);
      } else {
        setUser(null);
        setCartItems([]); // Ensure cart is empty if no user found
      }
    } catch (err) {
      console.error("Failed to load initial data from sessionStorage:", err);
      sessionStorage.clear(); // Clear potentially corrupted session data
      setCartItems([]);
      setUser(null);
    } finally {
      setLoading(false); // Set loading to false once initial data attempt is complete
    }
  }, []); // Empty dependency array means this function is created once

  /**
   * Effect hook to run initial data loading once on component mount.
   */
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Dependency on loadInitialData to ensure it runs

  /**
   * Effect hook for periodic session checks to keep user state up-to-date.
   * This runs independently of the initial load.
   */
  useEffect(() => {
    const checkSessionPeriodically = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          if (user !== null) { // Only clear if user was previously logged in
            setUser(null);
            setCartItems([]); // Clear cart locally if session expired/invalid
          }
          return;
        }

        const { user: loggedInUser } = await res.json();

        // Update user state only if it has changed
        if (!user || user._id !== loggedInUser._id || user.email !== loggedInUser.email) {
          setUser(loggedInUser);
          // Only fetch cart from DB if user has just logged in or changed
          // If the user is already set, assume cart is already loaded or being handled by other actions
          if (user === null || user._id !== loggedInUser._id) {
             await fetchCartFromDB(loggedInUser._id);
          }
        }
      } catch (err) {
        console.error("Error checking session periodically:", err);
        // Optionally, clear user and cart on session check error
        setUser(null);
        setCartItems([]);
      }
    };

    // Set up interval for periodic session checks (e.g., every 10 seconds)
    const interval = setInterval(checkSessionPeriodically, 10000);
    return () => clearInterval(interval);
  }, [user]); // Re-run this effect if the user object changes

  /**
   * Saves the current cart items to the database.
   * @param {Array} newCart - The array of cart items to save.
   */
  const saveCartToDB = async (newCart) => {
    if (!user?._id) {
      console.warn("No user logged in, cart not saved to DB.");
      return;
    }
    setIsSavingCart(true);
    try {
      await fetch("/api/cart/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, cart: newCart }),
      });
      // After successful save, ensure local cart reflects DB state
      // For simplicity, we assume newCart is the correct state.
    } catch (err) {
      console.error("Error saving cart:", err);
      toast.error("Failed to update cart. Please try again.");
      setTimeout(() => setFeedbackMessage(null), 3000); // Clear feedback after delay
    } finally {
      setIsSavingCart(false);
    }
  };

  /**
   * Adds a product to the cart.
   */
  const addToCart = (product, selectedColor) => {
    if (!user?._id) {
      toast.error("Please log in to add items to your cart.");
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    const normalizedColor = selectedColor ? selectedColor.toLowerCase().trim() : "";

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === product._id && item.color === normalizedColor
      );

      let newCart;
      if (existingItemIndex > -1) {
        newCart = prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        newCart = [
          ...prevItems,
          {
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.image, // Include image in cart item
            color: normalizedColor,
            quantity: product.quantity || 1,
          },
        ];
      }
      saveCartToDB(newCart);
      return newCart;
    });
  };

  /**
   * Removes a specific product variation from the cart.
   */
  const removeFromCart = (productId, color) => {
    const normalizedColor = color ? color.toLowerCase().trim() : "";

    setCartItems((prevItems) => {
      const newCart = prevItems.filter(
        (item) => !(item.productId === productId && item.color === normalizedColor)
      );
      saveCartToDB(newCart);
      return newCart;
    });
  };

  /**
   * Clears all items from the cart both locally and in the database.
   */
  const clearCart = () => {
    setCartItems([]);
    saveCartToDB([]);
  };

  /**
   * Clears all items from the cart only locally, without affecting the database.
   */
  const clearCartLocalOnly = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        clearCartLocalOnly,
        feedbackMessage,
        isSavingCart,
        user,
        loading, // NEW: Expose the loading state
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to easily consume the CartContext.
 */
export const useCart = () => useContext(CartContext);