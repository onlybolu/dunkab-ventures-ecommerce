"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  const fetchCartFromDB = async (userId) => {
    try {
      const cartRes = await fetch(`/api/cart/${userId}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (cartRes.ok) {
        const data = await cartRes.json();
        setCartItems(data.cart || []);
      } else {
        setCartItems([]); // if no cart found
      }
    } catch (err) {
      console.error("Error fetching updated cart:", err);
      setCartItems([]);
    }
  };

  // Watch for login/logout changes
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          // LOGGED OUT
          if (user !== null) {
            setUser(null);
            setCartItems([]); // reset cart immediately
          }
          return;
        }

        const { user: loggedInUser } = await res.json();

        // If newly logged in or changed user
        if (!user || user._id !== loggedInUser._id) {
          setUser(loggedInUser);
          await fetchCartFromDB(loggedInUser._id); // fetch their saved cart
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };

    // Run on mount + every 5s to detect changes
    checkSession();
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const saveCartToDB = async (newCart) => {
    if (!user?._id) return;
    try {
      await fetch("/api/cart/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, cart: newCart }),
      });
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  };

  const addToCart = (product) => {
    if (!user?._id) {
      alert("Please log in to add to cart");
      return;
    }
  
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.productId === product._id);
      let newCart;
      if (existing) {
        newCart = prevItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        newCart = [...prevItems, { productId: product._id, quantity: product.quantity || 1 }];
      }
      saveCartToDB(newCart); // send correct format to backend
      return newCart;
    });
  };
  

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const newCart = prevItems.filter((item) => item._id !== productId);
      saveCartToDB(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveCartToDB([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
