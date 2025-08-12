"use client"
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "../../../../components/productcard";
import Image from "next/image";
import Logo from "../../../../components/Logo";

const PRODUCTS_PER_PAGE = 12;

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [previousPath, setPreviousPath] = useState(null);
  

  // Save previous path for breadcrumb
  useEffect(() => {
    const lastPath = sessionStorage.getItem("currentPath");
    if (lastPath) setPreviousPath(lastPath);
    sessionStorage.setItem("lastPath", pathname);
  }, [pathname]);

  // Fetch products
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

  // Refetch on filter/search/page change
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts();
    }, 400); // debounce typing

    return () => clearTimeout(delay);
  }, [query, brand, minPrice, maxPrice, page]);

  const handleSearchChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // reset to first page
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatPathname = (path) => {
    if (path === "/") return "Home";
    return path
      .split("/")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" / ");
  };

  return (
    <main>
      {showAuthModal && (
        <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Header Image */}
      <div className="w-full relative">
        <Image
          src={"/productbg.png"}
          alt="Products"
          width={500}
          height={500}
          className="w-full h-100"
        />
        <div className="absolute top-0 left-0 w-full h-100 flex flex-col items-center justify-center bg-white/30 bg-opacity-50 text-white text-2xl font-bold">
          <div className="space-x-2 flex items-center">
            <Logo width={"w-15"} height={"h-20"} hidden={"hidden"} fontSize={"text-2xl"} />
            {previousPath && (
              <Link href={previousPath} className="hover:underline text-3xl font-semibold text-gray-700">
                {formatPathname(previousPath)}
              </Link>
            )}
          </div>
          <div className="text-gray-600 flex gap-2">
            <p className="font-medium">Home</p>
            <p className="font-bold text-black">{">"}</p>
            <p className="font-medium">Products</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-6 max-w-7xl mx-auto">
        <input
          type="search"
          placeholder="Search products..."
          className="border border-gray-300 px-4 py-4 outline-0 rounded-xl w-full shadow-lg mb-10"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        {error && (
          <div className="text-red-600 text-center mb-6 font-medium">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-600 text-xl">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-600 text-xl">No products available</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onLoginPopup={() => setShowAuthModal(true)}
                />
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
      </div>
    </main>
  );
}
