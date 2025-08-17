// src/context/cartContext.js
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Create the CartContext
const CartContext = createContext();

/**
 * CartProvider component that manages the cart state and provides it to its children.
 * @param {object} { children } - React children to be rendered within the context.
 */
export function CartProvider({ children }) {
  // State to hold the current cart items. Initialized from sessionStorage.
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      const storedCart = sessionStorage.getItem("cartItems");
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });
  
  // State to hold the authenticated user information
  const [user, setUser] = useState(null);
  
  // State to indicate if the initial context data (user, cart) is loading
  const [loading, setLoading] = useState(true);

  // New: A single, robust function to fetch both the user session and their cart
  const fetchSessionAndCart = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        // No active session or failed fetch. Clear user and cart state.
        setUser(null);
        setCartItems([]);
        sessionStorage.removeItem("user");
        return;
      }

      const { user: loggedInUser } = await res.json();
      
      // Update user state and store it
      setUser(loggedInUser);
      sessionStorage.setItem("user", JSON.stringify(loggedInUser));

      // Fetch the cart associated with the authenticated user
      const cartRes = await fetch(`/api/cart/${loggedInUser._id}`, {
        cache: "no-store",
        credentials: "include",
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
      console.error("Error fetching session or cart:", err);
      setUser(null);
      setCartItems([]);
      sessionStorage.clear(); // Clear potentially corrupted session data
    } finally {
      setLoading(false); // Set loading to false once the check is complete
    }
  }, []);

  // Effect hook to run initial data loading once on component mount
  useEffect(() => {
    fetchSessionAndCart();
    
    // Set up a periodic check to keep the session fresh
    const interval = setInterval(fetchSessionAndCart, 10000); // e.g., every 10 seconds
    return () => clearInterval(interval);
  }, [fetchSessionAndCart]);

  // A helper function to save the cart to the database
  const saveCartToDB = async (newCart) => {
    if (!user?._id) {
      console.warn("No user logged in, cart not saved to DB.");
      return;
    }
    try {
      await fetch("/api/cart/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, cart: newCart }),
      });
    } catch (err) {
      console.error("Error saving cart:", err);
      toast.error("Failed to update cart. Please try again.");
    }
  };

  const addItemToCart = (product, selectedColor) => {
    if (!user?._id) {
      toast.error("Please log in to add items to your cart.");
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
            image: product.image, 
            color: normalizedColor,
            quantity: product.quantity || 1,
          },
        ];
      }
      saveCartToDB(newCart);
      return newCart;
    });
  };

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

  const clearCart = () => {
    setCartItems([]);
    saveCartToDB([]);
  };

  const updateQuantity = (productId, color, newQuantity) => {
    const normalizedColor = color ? color.toLowerCase().trim() : "";
    setCartItems((prevItems) => {
        const updatedCart = prevItems
            .map((item) =>
                item.productId === productId && item.color === normalizedColor
                    ? { ...item, quantity: newQuantity }
                    : item
            )
            .filter((item) => item.quantity > 0);
        saveCartToDB(updatedCart);
        return updatedCart;
    });
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItemToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        cartTotal,
        user,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);