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
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      const storedCart = sessionStorage.getItem("cartItems");
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize fetchSessionAndCart, its dependencies are only stable setters
  const fetchSessionAndCart = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        setCartItems([]);
        sessionStorage.removeItem("user");
        return;
      }

      const { user: loggedInUser } = await res.json();
      
      setUser(loggedInUser);
      sessionStorage.setItem("user", JSON.stringify(loggedInUser));

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
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []); // setUser and setCartItems are stable React dispatch functions, so no need to list them.

  // Effect hook for initial data loading and periodic refresh
  useEffect(() => {
    fetchSessionAndCart(); // Initial fetch
    
    // Set up a periodic check to keep the session fresh
    const interval = setInterval(fetchSessionAndCart, 200000); // 200 seconds
    return () => clearInterval(interval);
  }, [fetchSessionAndCart]); // fetchSessionAndCart is memoized, so this effect runs once and then only when the function itself changes (which is rare).

  // A helper function to save the cart to the database
  // THIS FUNCTION MUST BE MEMOIZED as it uses the 'user' state
  const saveCartToDB = useCallback(async (newCart) => {
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
  }, [user]); // Dependency: user. This function will only be recreated if 'user' changes.

  // Memoize addItemToCart
  const addItemToCart = useCallback((product, selectedColor) => {
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
      saveCartToDB(newCart); // This now calls the stable saveCartToDB
      return newCart;
    });
  }, [user, saveCartToDB]); // Dependencies: user and the memoized saveCartToDB

  // Memoize removeFromCart
  const removeFromCart = useCallback((productId, color) => {
    const normalizedColor = color ? color.toLowerCase().trim() : "";
    setCartItems((prevItems) => {
      const newCart = prevItems.filter(
        (item) => !(item.productId === productId && item.color === normalizedColor)
      );
      saveCartToDB(newCart); // This now calls the stable saveCartToDB
      return newCart;
    });
  }, [saveCartToDB]); // Dependency: the memoized saveCartToDB

  // Memoize clearCart
  const clearCart = useCallback(() => {
    setCartItems([]);
    saveCartToDB([]); // This now calls the stable saveCartToDB
  }, [saveCartToDB]); // Dependency: the memoized saveCartToDB

  // Memoize updateQuantity
  const updateQuantity = useCallback((productId, color, newQuantity) => {
    const normalizedColor = color ? color.toLowerCase().trim() : "";
    setCartItems((prevItems) => {
        const updatedCart = prevItems
            .map((item) =>
                item.productId === productId && item.color === normalizedColor
                    ? { ...item, quantity: newQuantity }
                    : item
            )
            .filter((item) => item.quantity > 0);
        saveCartToDB(updatedCart); // This now calls the stable saveCartToDB
        return updatedCart;
    });
  }, [saveCartToDB]);

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