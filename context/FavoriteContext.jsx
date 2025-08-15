"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const FavoriteContext = createContext(undefined);

/**
 * FavoriteProvider component that manages the user's wishlist state.
 * @param {object} { children } - React children to be rendered within the context.
 */
export function FavoriteProvider({ children }) {
  const [favorite, setFavorite] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoized function to fetch wishlist from the database
  const fetchWishlistFromDB = useCallback(async (userId) => {
    if (!userId) {
      setFavorite([]);
      return;
    }
    try {
      const res = await fetch(`/api/wishlist?userId=${userId}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setFavorite(data.wishlist || []);
      } else {
        setFavorite([]);
        console.error("Failed to fetch wishlist:", res.statusText);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setFavorite([]);
    }
  }, []);

  // New: Function to load user session from API and fetch initial data
  const loadInitialData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "include",
      });

      if (res.ok) {
        const session = await res.json();
        if (session.user) {
          setUser(session.user);
          await fetchWishlistFromDB(session.user._id);
        } else {
          setUser(null);
          setFavorite([]);
        }
      } else {
        setUser(null);
        setFavorite([]);
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      setUser(null);
      setFavorite([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWishlistFromDB]);

  // Effect hook to run initial data loading once on component mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Function to save wishlist changes to the database
  const saveWishlistToDB = async (productId) => {
    if (!user?._id) {
      console.warn("No user logged in, wishlist not saved to DB.");
      return;
    }
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, productId }),
      });
    } catch (err) {
      console.error("Error saving wishlist:", err);
      toast.error("Failed to save wishlist in database.");
    }
  };

  const handleFavourite = useCallback(async (productId) => {
    if (!user?._id) {
      toast.error("Please log in to add items to your wishlist.");
      return;
    }

    try {
      await saveWishlistToDB(productId);
      
      setFavorite((prev) => {
        const isCurrentlyFavorite = prev.includes(productId);
        if (isCurrentlyFavorite) {
          toast.info("Product removed from wishlist.");
          return prev.filter(item => item !== productId);
        } else {
          toast.success("Product added to wishlist!");
          return [...prev, productId];
        }
      });
    } catch (err) {
      console.error("Error updating wishlist:", err);
      toast.error("Failed to save wishlist in database.");
    }
  }, [user, saveWishlistToDB]);

  const contextValue = {
    favorite,
    handleFavourite,
    user,
    loading,
  };

  return (
    <FavoriteContext.Provider value={contextValue}>
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