"use client"
import { createContext, useState } from "react";

export const FavoriteContext = createContext(undefined);

export const FavoriteProvider = ({ children }) => {
  const [favorite, setFavorite] = useState([]);

  const handleFavourite = (_id) => {
    setFavorite((prev) =>
      prev.includes(_id)
        ? prev.filter((item) => item !== _id)
        : [...prev, _id]
    );
  };

  return (
    <FavoriteContext.Provider value={{ favorite, handleFavourite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
