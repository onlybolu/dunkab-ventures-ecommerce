"use client";

import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <div className="border border-gray-300 rounded-2xl p-4 shadow-md hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-xl"
      />
      <h2 className="text-xl font-semibold mt-2">{product.title}</h2>
      <p className="text-gray-600 mb-2">₦{product.price.toLocaleString()}</p>
      <Link href={`/product/${product._id}`}>
        <button className="mt-2 bg-blue-600 text-white px-4 cursor-pointer py-2 rounded-xl">
          View Product
        </button>
      </Link>
    </div>
  );
}
