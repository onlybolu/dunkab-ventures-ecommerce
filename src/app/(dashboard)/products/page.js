"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "../../../../components/productcard";
import Image from "next/image";
import Logo from "../../../../components/Logo";
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";

const PRODUCTS_PER_PAGE = 12;

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [previousPath, setPreviousPath] = useState(null);

  const filterRef = useRef(null);

  useEffect(() => {
    const lastPath = sessionStorage.getItem("currentPath");
    if (lastPath) setPreviousPath(lastPath);
    sessionStorage.setItem("lastPath", pathname);
  }, [pathname]);

  // Function to normalize category names (e.g., "coolers" -> "cooler")
  const getSingularCategory = (cat) => {
    if (typeof cat !== "string") return cat;
    // Simple check to remove 's' from the end
    return cat.endsWith("s") ? cat.slice(0, -1) : cat;
  };

  // New useEffect to fetch and normalize categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();

        // Normalize categories and get unique values
        const normalizedCategories = data.map(getSingularCategory);
        const uniqueCategories = ["all", ...new Set(normalizedCategories)];

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (category !== "all") {
        const singular = category;
        const plural = `${category}s`;
        params.append("category", JSON.stringify({ $in: [singular, plural] }));
      }
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
    const delay = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(delay);
  }, [query, category, minPrice, maxPrice, page]);

  const handleSearchChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (category !== "all") {
      const singular = category;
      const plural = `${category}s`;
      params.set("category", JSON.stringify({ $in: [singular, plural] }));
    } else {
      params.delete("category");
    }
    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }
    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }
    params.set("page", "1");
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
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-white py-8 md:py-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-700">Products</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            All Products
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
              <div className="flex items-center justify-between md:block">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {isFilterOpen ? (
                    <FiChevronUp size={24} className="text-gray-600" />
                  ) : (
                    <FiChevronDown size={24} className="text-gray-600" />
                  )}
                </button>
              </div>

              <div className={`${isFilterOpen ? "block" : "hidden"} md:block`}>
                <div className="mb-6">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={query}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Dynamic Category Filter */}
                {/* <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Category</h3>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleFilterChange}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Product Listing Section */}
          <section className="md:col-span-3">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-600 text-xl font-medium">
                No products found matching your criteria.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center mt-10 space-x-4">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}