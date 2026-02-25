"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CartContext = createContext();

const normalizeColor = (color) => (color ? String(color).toLowerCase().trim() : "");
const normalizeUser = (value) => {
  if (!value || typeof value !== "object") return null;
  const id = value._id || value.id;
  if (!id) return null;
  return { ...value, id, _id: id };
};

const normalizeCartItem = (item) => {
  const productId = item.productId || item._id;
  return {
    productId,
    _id: productId,
    title: item.title || item.name || "Product",
    price: item.price,
    image: item.image,
    quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    color: normalizeColor(item.color),
  };
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = sessionStorage.getItem("cartItems");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const saveTimerRef = useRef(null);
  const saveInFlightRef = useRef(false);

  const persistLocalCart = useCallback((nextCart) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("cartItems", JSON.stringify(nextCart));
  }, []);

  const applyLoggedOutState = useCallback(() => {
    setUser(null);
    setCartItems([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("cartItems");
    }
  }, []);

  const loadUserCart = useCallback(async (loggedInUser, signal) => {
    const normalizedUser = normalizeUser(loggedInUser);
    if (!normalizedUser?._id) {
      applyLoggedOutState();
      return;
    }

    setUser(normalizedUser);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("user", JSON.stringify(normalizedUser));
    }

    const cartRes = await fetch(`/api/cart/${normalizedUser._id}`, {
      cache: "no-store",
      credentials: "include",
      signal,
    });

    if (!cartRes.ok) {
      setCartItems([]);
      persistLocalCart([]);
      return;
    }

    const data = await cartRes.json();
    const normalized = Array.isArray(data.cart) ? data.cart.map(normalizeCartItem) : [];
    setCartItems(normalized);
    persistLocalCart(normalized);
  }, [applyLoggedOutState, persistLocalCart]);

  const fetchSessionAndCart = useCallback(async (signal) => {
    try {
      const sessionRes = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "include",
        signal,
      });

      if (!sessionRes.ok) {
        applyLoggedOutState();
        return;
      }

      const { user: loggedInUser } = await sessionRes.json();
      await loadUserCart(loggedInUser, signal);
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("CartContext: fetchSessionAndCart failed", err);
      }
    } finally {
      setLoading(false);
    }
  }, [applyLoggedOutState, loadUserCart]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSessionAndCart(controller.signal);

    const refresh = () => {
      const c = new AbortController();
      fetchSessionAndCart(c.signal);
      setTimeout(() => c.abort(), 7000);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    const onAuthChanged = (event) => {
      const { type, user: payloadUser } = event?.detail || {};
      if (type === "logout") {
        applyLoggedOutState();
        setLoading(false);
        return;
      }

      const normalizedUser = normalizeUser(payloadUser);
      if (normalizedUser?._id) {
        const c = new AbortController();
        setLoading(false);
        loadUserCart(normalizedUser, c.signal).catch((err) => {
          if (err?.name !== "AbortError") {
            console.error("CartContext: auth change sync failed", err);
          }
        });
        setTimeout(() => c.abort(), 7000);
        return;
      }

      refresh();
    };

    window.addEventListener("auth:changed", onAuthChanged);

    return () => {
      controller.abort();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("auth:changed", onAuthChanged);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [applyLoggedOutState, fetchSessionAndCart, loadUserCart]);

  const saveCartToDB = useCallback((nextCart) => {
    if (!user?._id) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      if (saveInFlightRef.current) return;
      saveInFlightRef.current = true;

      try {
        await fetch("/api/cart/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id, cart: nextCart }),
        });
      } catch (err) {
        console.error("CartContext: saveCartToDB failed", err);
      } finally {
        saveInFlightRef.current = false;
      }
    }, 250);
  }, [user?._id]);

  const updateCart = useCallback((updater) => {
    setCartItems((prev) => {
      const next = updater(prev).map(normalizeCartItem);
      persistLocalCart(next);
      saveCartToDB(next);
      return next;
    });
  }, [persistLocalCart, saveCartToDB]);

  const addItemToCart = useCallback((product, selectedColor) => {
    if (!user?._id) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    const productId = product?._id || product?.productId;
    if (!productId) return;

    const color = normalizeColor(selectedColor ?? product?.color);
    const incomingQty = Number(product?.quantity) > 0 ? Number(product.quantity) : 1;

    updateCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === productId && normalizeColor(item.color) === color);

      if (idx >= 0) {
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + incomingQty } : item
        );
      }

      return [
        ...prev,
        {
          productId,
          _id: productId,
          title: product.title || product.name,
          price: product.price,
          image: product.image,
          color,
          quantity: incomingQty,
        },
      ];
    });
  }, [updateCart, user?._id]);

  const removeFromCart = useCallback((productId, color) => {
    const normalizedColor = normalizeColor(color);

    updateCart((prev) =>
      prev.filter((item) => !(item.productId === productId && normalizeColor(item.color) === normalizedColor))
    );
  }, [updateCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    persistLocalCart([]);
    saveCartToDB([]);
  }, [persistLocalCart, saveCartToDB]);

  const updateQuantity = useCallback((productId, color, newQuantity) => {
    const normalizedColor = normalizeColor(color);
    const quantity = Number(newQuantity);

    if (!Number.isFinite(quantity)) return;

    updateCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && normalizeColor(item.color) === normalizedColor
            ? { ...item, quantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, [updateCart]);

  const logout = useCallback(() => {
    applyLoggedOutState();
  }, [applyLoggedOutState]);

  const cartTotal = cartItems.reduce((total, item) => {
    const price = typeof item.price === "number"
      ? item.price
      : parseFloat(String(item.price || "").replace(/[^0-9.]/g, "")) || 0;
    return total + price * item.quantity;
  }, 0);

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
        logout,
        refreshSession: fetchSessionAndCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
