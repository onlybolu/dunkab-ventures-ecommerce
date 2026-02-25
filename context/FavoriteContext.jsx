"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const FavoriteContext = createContext(undefined);
const normalizeUser = (value) => {
  if (!value || typeof value !== "object") return null;
  const id = value._id || value.id;
  if (!id) return null;
  return { ...value, id, _id: id };
};

export function FavoriteProvider({ children }) {
  const [favorite, setFavorite] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  const fetchWishlistFromDB = useCallback(async (userId, signal) => {
    if (!userId) {
      setFavorite([]);
      return;
    }

    try {
      const res = await fetch(`/api/wishlist?userId=${userId}`, {
        cache: "no-store",
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        setFavorite([]);
        return;
      }

      const data = await res.json();
      setFavorite(Array.isArray(data.wishlist) ? data.wishlist : []);
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("FavoriteContext: fetchWishlistFromDB failed", err);
      }
      setFavorite([]);
    }
  }, []);

  const logoutUserLocally = useCallback(() => {
    setUser(null);
    setFavorite([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("user");
    }
  }, []);

  const loadInitialData = useCallback(async (signal) => {
    try {
      let currentUser = null;

      const storedUser = sessionStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        currentUser = normalizeUser(JSON.parse(storedUser));
      } else {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
          signal,
        });

        if (res.ok) {
          const data = await res.json();
          currentUser = normalizeUser(data.user || null);
        }
      }

      if (!currentUser?._id) {
        setUser(null);
        setFavorite([]);
        return;
      }

      setUser(currentUser);
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      await fetchWishlistFromDB(currentUser._id, signal);
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("FavoriteContext: loadInitialData failed", err);
      }
      setUser(null);
      setFavorite([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWishlistFromDB]);

  useEffect(() => {
    const controller = new AbortController();
    loadInitialData(controller.signal);

    const refresh = () => {
      const c = new AbortController();
      loadInitialData(c.signal);
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
        logoutUserLocally();
        setLoading(false);
        return;
      }

      const nextUser = normalizeUser(payloadUser);
      if (!nextUser?._id) {
        refresh();
        return;
      }

      setUser(nextUser);
      sessionStorage.setItem("user", JSON.stringify(nextUser));
      setLoading(false);

      const c = new AbortController();
      fetchWishlistFromDB(nextUser._id, c.signal).catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("FavoriteContext: auth change sync failed", err);
        }
      });
      setTimeout(() => c.abort(), 7000);
    };

    window.addEventListener("auth:changed", onAuthChanged);

    return () => {
      controller.abort();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("auth:changed", onAuthChanged);
    };
  }, [fetchWishlistFromDB, loadInitialData, logoutUserLocally]);

  const handleFavourite = useCallback(async (productId) => {
    if (!user?._id) {
      toast.error("Please log in to add items to your wishlist.", { autoClose: 1500 });
      return;
    }

    const prev = favorite;
    const optimistic = prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId];

    setFavorite(optimistic);
    setIsSavingFavorite(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, productId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFavorite(prev);
        toast.error(data?.message || "Failed to update wishlist", { autoClose: 1500 });
        return;
      }

      setFavorite(Array.isArray(data.wishlist) ? data.wishlist : optimistic);
      toast.success(data?.message || "Wishlist updated", { autoClose: 1200 });
    } catch (err) {
      console.error("FavoriteContext: handleFavourite failed", err);
      setFavorite(prev);
      toast.error("An unexpected error occurred. Please try again.", { autoClose: 1500 });
    } finally {
      setIsSavingFavorite(false);
    }
  }, [favorite, user?._id]);

  const clearFavorite = useCallback(async () => {
    if (!user?._id) {
      setFavorite([]);
      return;
    }

    const previous = favorite;
    setFavorite([]);

    try {
      const res = await fetch("/api/wishlist/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!res.ok) {
        setFavorite(previous);
        toast.error("Failed to clear wishlist.", { autoClose: 1500 });
        return;
      }

      toast.success("Wishlist cleared successfully!", { autoClose: 1200 });
    } catch (err) {
      console.error("FavoriteContext: clearFavorite failed", err);
      setFavorite(previous);
      toast.error("Failed to clear wishlist.", { autoClose: 1500 });
    }
  }, [favorite, user?._id]);

  const clearFavoriteLocalOnly = useCallback(() => {
    setFavorite([]);
  }, []);

  return (
    <FavoriteContext.Provider
      value={{
        favorite,
        handleFavourite,
        user,
        loading,
        logoutUserLocally,
        isSavingFavorite,
        clearFavorite,
        clearFavoriteLocalOnly,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
};
