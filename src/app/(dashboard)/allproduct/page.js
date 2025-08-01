"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../../../components/productcard";

const PRODUCTS_PER_PAGE = 6;

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (query) params.append("q", query);
      if (brand !== "all") params.append("brand", brand);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("page", page);
      params.append("limit", PRODUCTS_PER_PAGE);

      const res = await fetch(`/api/products?${params.toString()}`);

      const data = await res.json();

      if (!res.ok) {
        setProducts([]);
        setTotalPages(1);
        setError(data.message || "Failed to fetch products.");
        return;
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Invalid products format");
      }

      setProducts(data.products);
      setTotalPages(data.totalPages || 1);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong");
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <form
        onSubmit={handleSearch}
        className="mb-10 grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <input
          type="text"
          placeholder="🔍 Search products..."
          className="border border-gray-300 px-4 py-2 rounded-xl w-full shadow-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* You can re-enable brand & price filters here */}
      </form>

      {error && (
        <div className="text-red-600 text-center mb-6 font-medium">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-gray-600 text-xl">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-600 text-xl">No products found</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 items-center">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
