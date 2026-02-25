"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "../../../../components/productcard";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

const PRODUCTS_PER_PAGE = 12;

const normalizeCategoryValue = (raw) => {
  if (!raw) return "all";

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.$in && Array.isArray(parsed.$in) && parsed.$in.length) {
      return String(parsed.$in[0]).toLowerCase();
    }
  } catch {
    // not JSON, use as-is
  }

  return String(raw).toLowerCase();
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const appliedCategory = normalizeCategoryValue(searchParams.get("category"));
  const appliedMinPrice = searchParams.get("minPrice") || "";
  const appliedMaxPrice = searchParams.get("maxPrice") || "";

  const [categoryInput, setCategoryInput] = useState(appliedCategory);
  const [minPriceInput, setMinPriceInput] = useState(appliedMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(appliedMaxPrice);

  useEffect(() => {
    setCategoryInput(appliedCategory);
    setMinPriceInput(appliedMinPrice);
    setMaxPriceInput(appliedMaxPrice);
  }, [appliedCategory, appliedMinPrice, appliedMaxPrice]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();

        const normalized = Array.from(
          new Set(
            (Array.isArray(data) ? data : [])
              .filter(Boolean)
              .map((c) => String(c).trim().toLowerCase())
          )
        );

        setCategories(["all", ...normalized]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (appliedCategory !== "all") params.append("category", appliedCategory);
        if (appliedMinPrice) params.append("minPrice", appliedMinPrice);
        if (appliedMaxPrice) params.append("maxPrice", appliedMaxPrice);
        params.append("page", String(page));
        params.append("limit", String(PRODUCTS_PER_PAGE));

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
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
        if (err?.name === "AbortError") return;
        console.error("Error:", err);
        setError("Something went wrong");
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [query, appliedCategory, appliedMinPrice, appliedMaxPrice, page]);

  useEffect(() => {
    setPage(1);
  }, [query, appliedCategory, appliedMinPrice, appliedMaxPrice]);

  const updateUrlFilters = ({ q = query, category = categoryInput, min = minPriceInput, max = maxPriceInput } = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    if (q) params.set("q", q);
    else params.delete("q");

    if (category && category !== "all") params.set("category", category);
    else params.delete("category");

    if (min) params.set("minPrice", min);
    else params.delete("minPrice");

    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (value) => {
    updateUrlFilters({ q: value });
  };

  const handleApplyFilters = () => {
    updateUrlFilters();
  };

  const clearFilters = () => {
    setCategoryInput("all");
    setMinPriceInput("");
    setMaxPriceInput("");
    updateUrlFilters({ category: "all", min: "", max: "" });
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
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
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
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
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
