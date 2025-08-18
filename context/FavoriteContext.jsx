// src/app/FavoriteContext.js

"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const FavoriteContext = createContext(undefined);

/**
 * FavoriteProvider component that manages the user's wishlist state.
 * It handles adding, removing, and clearing items from the wishlist,
 * as well as synchronizing the wishlist with a backend database.
 * @param {object} { children } - React children to be rendered within the context.
 */
export function FavoriteProvider({ children }) {
  const [favorite, setFavorite] = useState([]);
  const [user, setUser] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the user's wishlist from the database.
   * @param {string} userId - The ID of the current user.
   */
  const fetchWishlistFromDB = useCallback(async (userId) => {
    console.log("FavoriteContext: fetchWishlistFromDB called for userId:", userId);
    if (!userId) {
      setFavorite([]);
      console.log("FavoriteContext: No userId, clearing favorite list.");
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
        console.log("FavoriteContext: Successfully fetched wishlist from DB:", data.wishlist);
      } else {
        setFavorite([]);
        console.error("FavoriteContext: Failed to fetch wishlist:", res.statusText);
      }
    } catch (err) {
      console.error("FavoriteContext: Error fetching wishlist:", err);
      setFavorite([]);
    }
  }, []);

  /**
   * Function to perform client-side logout cleanup.
   * This clears user and favorite states and removes user data from sessionStorage.
   */
  const logoutUserLocally = useCallback(() => {
    setUser(null);
    setFavorite([]);
    sessionStorage.removeItem("user"); // Clear user from session storage
    console.log("FavoriteContext: Performed local user logout cleanup.");
  }, []);

  /**
   * Function to load the user from sessionStorage first, then check API.
   * This prevents a visible "flash" of non-logged-in state.
   */
  const loadInitialData = useCallback(async () => {
    console.log("FavoriteContext: loadInitialData called.");
    try {
      // First, attempt to get user from session storage
      const storedUser = sessionStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("FavoriteContext: User found in sessionStorage:", parsedUser);
        // If user found, fetch their wishlist from DB
        await fetchWishlistFromDB(parsedUser._id);
      } else {
        console.log("FavoriteContext: No user in sessionStorage, checking backend session.");
        // If no user in session storage, check backend session
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (res.ok) {
          const session = await res.json();
          if (session.user) {
            setUser(session.user);
            console.log("FavoriteContext: User found via backend session:", session.user);
            await fetchWishlistFromDB(session.user._id);
          } else {
            setUser(null);
            setFavorite([]);
            console.log("FavoriteContext: Backend session found no user.");
          }
        } else {
          setUser(null);
          setFavorite([]);
          console.log("FavoriteContext: Backend session API call failed.");
        }
      }
    } catch (err) {
      console.error("FavoriteContext: Error loading initial data:", err);
      sessionStorage.clear(); // Clear potentially corrupted session data
      setFavorite([]);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("FavoriteContext: Initial data loading finished. Loading state set to false.");
    }
  }, [fetchWishlistFromDB]);

  /**
   * Effect hook to run initial data loading once on component mount.
   */
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Effect hook for periodic session checks to keep user state up-to-date.
   * This runs independently of the initial load.
   */
  useEffect(() => {
    const checkSessionPeriodically = async () => {
      console.log("FavoriteContext: Periodic session check initiated.");
      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          if (user !== null) { // Only clear if user was previously logged in
            console.log("FavoriteContext: Session check failed and user was logged in, logging out locally.");
            logoutUserLocally(); // Call the local logout cleanup
          } else {
            console.log("FavoriteContext: Session check failed but user was already logged out.");
          }
          return;
        }

        const { user: loggedInUser } = await res.json();
        console.log("FavoriteContext: Periodic session check received user:", loggedInUser);

        // Update user state only if it has changed
        if (!user || user._id !== loggedInUser._id || user.email !== loggedInUser.email) {
          setUser(loggedInUser);
          console.log("FavoriteContext: User state updated due to periodic check.");
          // Only fetch wishlist from DB if user has just logged in or changed
          if (user === null || user._id !== loggedInUser._id) {
             console.log("FavoriteContext: User changed or logged in, refetching wishlist.");
             await fetchWishlistFromDB(loggedInUser._id);
          }
        } else {
          console.log("FavoriteContext: User state unchanged by periodic check.");
        }
      } catch (err) {
        console.error("FavoriteContext: Error checking session periodically:", err);
        logoutUserLocally(); // Call the local logout cleanup
      }
    };

    // Set up interval for periodic session checks (e.g., every 10 seconds)
    const interval = setInterval(checkSessionPeriodically, 10000);
    return () => clearInterval(interval);
  }, [user, fetchWishlistFromDB, logoutUserLocally]);

  /**
   * Saves wishlist changes to the database.
   * @param {string} productId - The ID of the product to add/remove.
   * @returns {Promise<void>} - A promise that resolves when the save is complete.
   */
  const saveWishlistToDB = async (productId) => {
    console.log("FavoriteContext: saveWishlistToDB called for productId:", productId);
    if (!user?._id) {
      console.warn("FavoriteContext: No user logged in, wishlist not saved to DB.");
      throw new Error("User not logged in.");
    }
    setIsSavingFavorite(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, productId }),
      });

      if (res.ok) {
        console.log("FavoriteContext: Backend /api/wishlist POST successful. Re-fetching full wishlist.");
        await fetchWishlistFromDB(user._id);
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.message || "Failed to update wishlist in database.";
        // FIX: Show a single, generic error toast here for database-level failures.
        toast.error(errorMessage, { autoClose: 1500 });
        console.error("FavoriteContext: Backend /api/wishlist POST failed:", res.status, errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("FavoriteContext: Error in saveWishlistToDB:", err);
      // FIX: Show a single, generic error toast for network/server failures.
      toast.error("An unexpected error occurred. Please try again.", { autoClose: 1500 });
      throw err;
    } finally {
      setIsSavingFavorite(false);
      console.log("FavoriteContext: saveWishlistToDB finished.");
    }
  };

  const handleFavourite = useCallback(async (productId) => {
    console.log("FavoriteContext: handleFavourite called for productId:", productId);
    if (!user?._id) {
      // FIX: Use autoClose to set toast display duration
      toast.error("Please log in to add items to your wishlist.", { autoClose: 1500 });
      return;
    }

    let actionPerformed;
    // Optimistically update UI
    setFavorite((prev) => {
      const isCurrentlyFavorite = prev.includes(productId);
      let newFavorite;

      if (isCurrentlyFavorite) {
        newFavorite = prev.filter(item => item !== productId);
        actionPerformed = 'remove';
      } else {
        newFavorite = [...prev, productId];
        actionPerformed = 'add';
      }
      console.log("FavoriteContext: Optimistic UI update. New favorite state:", newFavorite);
      return newFavorite;
    });

    try {
      await saveWishlistToDB(productId);
      console.log("FavoriteContext: saveWishlistToDB successful and wishlist re-fetched.");
      // FIX: Use autoClose to set toast display duration
      if (actionPerformed === 'add') {
          toast.success("Product successfully added to wishlist!", { autoClose: 1500 });
      } else {
          toast.info("Product successfully removed from wishlist.", { autoClose: 1500 });
      }
    } catch (err) {
      console.error("FavoriteContext: Error synchronizing wishlist with backend, reverting UI.", err);
      // If backend fails, revert the optimistic UI update to maintain accuracy
      await fetchWishlistFromDB(user._id);
      // The specific error toast (from saveWishlistToDB) is already handled.
    }
  }, [user, saveWishlistToDB, fetchWishlistFromDB]);


  /**
   * Clears all items from the favorite list both locally and in the database.
   */
  const clearFavorite = async () => {
    console.log("FavoriteContext: clearFavorite called.");
    if (!user?._id) {
      console.warn("FavoriteContext: No user logged in, cannot clear wishlist in DB.");
      setFavorite([]);
      return;
    }
    setFavorite([]);
    console.log("FavoriteContext: Optimistic local clear for wishlist.");
    try {
      await fetch("/api/wishlist/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      // FIX: Use autoClose to set toast display duration
      toast.success("Wishlist cleared successfully!", { autoClose: 1500 });
      console.log("FavoriteContext: Backend /api/wishlist/clear successful.");
    } catch (err) {
      console.error("FavoriteContext: Error clearing wishlist:", err);
      // FIX: Use autoClose to set toast display duration
      toast.error("Failed to clear wishlist in database.", { autoClose: 1500 });
      await fetchWishlistFromDB(user._id);
      console.log("FavoriteContext: Failed to clear wishlist in DB, re-fetching to restore state.");
    }
  };

  /**
   * Clears all items from the favorite list only locally, without affecting the database.
   */
  const clearFavoriteLocalOnly = useCallback(() => {
    setFavorite([]);
    console.log("FavoriteContext: clearFavoriteLocalOnly called, favorite list cleared locally.");
  }, []);

  const contextValue = {
    favorite,
    handleFavourite,
    user,
    loading,
    logoutUserLocally,
    feedbackMessage,
    isSavingFavorite,
    clearFavorite,
    clearFavoriteLocalOnly,
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