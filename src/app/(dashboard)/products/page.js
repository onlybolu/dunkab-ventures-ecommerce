"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "../../../../components/productcard";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
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

  const getSingularCategory = (cat) => {
    if (typeof cat !== "string") return cat;
    return cat.endsWith("s") ? cat.slice(0, -1) : cat;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const normalized = data.map(getSingularCategory);
        setCategories(["all", ...new Set(normalized)]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
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

        setProducts(Array.isArray(data.products) ? data.products : []);
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

    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [query, category, minPrice, maxPrice, page]);

  const handleSearchChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const resultsLabel = useMemo(() => {
    if (loading) return "Loading products";
    return `${products.length} products available`;
  }, [loading, products.length]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/30 to-white">
      <section className="border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Coolers & Essentials</span>
          </div>
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Catalog</p>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Engineered Coolers For Everyday Adventures</h1>
              <p className="mt-2 max-w-2xl text-slate-600">Shop high-performance coolers and complementary kitchen essentials with reliable quality, fast dispatch, and secure checkout.</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900">
              {resultsLabel}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex items-center justify-between lg:block">
              <h2 className="text-xl font-bold text-slate-900">Filter Products</h2>
              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Toggle filters"
              >
                {isFilterOpen ? <FiChevronUp size={22} /> : <FiChevronDown size={22} />}
              </button>
            </div>

            <div className={`${isFilterOpen ? "block" : "hidden"} space-y-5 lg:block`}>
              <div>
                <label htmlFor="search" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Search</label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search coolers..."
                    value={query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Price Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <h3 className="text-xl font-semibold text-slate-800">No products found</h3>
              <p className="mt-2 text-slate-600">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
