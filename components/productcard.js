"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProductCard({ product, onLoginPopup }) {
  // const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // const handleWishlist = async () => {
  //   if (!session) {
  //     onLoginPopup?.(); // Trigger popup
  //     return;
  //   }

  //   // Toggle wishlist state
  //   setIsWishlisted(!isWishlisted);

  //   // Call backend to save wishlist item
  //   await fetch("/api/wishlist", {
  //     method: isWishlisted ? "DELETE" : "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ productId: product._id }),
  //   });
  // };

  return (
    <div className="border border-gray-300 rounded-2xl p-4 shadow-md hover:shadow-2xl flex flex-col transition">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        
      </div>
      

      <h2 className="text-xl font-semibold mt-2">{product.title}</h2>
      <div className="flex flex-col justify-end h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-2">
      <p className="text-gray-600 mb-2">₦{product.price.toLocaleString()}</p>
      <Link href={`/product/${product._id}`}>
        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
          View Product
        </button>
      </Link>
      </div>
      </div>
      <div className="relative">
      {/* <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`absolute bottom-0 right-2 text-xl ${
            isWishlisted ? "text-red-500" : "text-black"
          }`}
        >
          {!isWishlisted ? (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-heart" viewBox="0 0 16 16">
  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
</svg>): (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-heart-fill" viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
</svg> )}
        </button> */}
      </div>
    </div>
  );
}
