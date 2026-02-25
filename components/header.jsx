"use client";

import Link from "next/link";
import Logo from "./Logo";
import Navbar from "./nav";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../context/cartContext";
import { useFavorite } from "../context/FavoriteContext";

const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { cartItems, user, loading, logout } = useCart();
  const { favorite, logoutUserLocally: logoutFavoriteUserLocally } = useFavorite();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const megaRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!megaRef.current) return;
      if (!megaRef.current.contains(event.target)) setIsMegaOpen(false);
    };

    if (isMegaOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isMegaOpen]);

  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cartItems]
  );

  const totalFavoriteItems = favorite.length;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    else params.delete("q");

    router.push(`/products?${params.toString()}`);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (err) {
      console.error("Error contacting server for logout:", err);
    }

    logout();
    logoutFavoriteUserLocally();
    sessionStorage.removeItem("currentPath");
    setShowProfilePopup(false);
    setShowLogoutPopup(true);
    router.push("/");
  };

  const desktopLinks = Navbar.filter((item) => item.name !== "Categories");

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-sm"}`}>
      {showLogoutPopup && <LogoutPopup onClose={() => setShowLogoutPopup(false)} />}
      {showProfilePopup && (
        <ProfilePopup user={user} onClose={() => setShowProfilePopup(false)} onLogout={handleLogout} router={router} />
      )}

      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
              </svg>
            </button>

            <Link href="/" className="flex-shrink-0">
              <Logo width={"w-11"} height={"h-11"} fontSize={"text-2xl"} />
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden w-full max-w-xl md:block">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search coolers, bags, kitchen essentials..."
                className="w-full rounded-full border border-slate-300 bg-white px-5 py-2.5 pr-14 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-white hover:bg-sky-700"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/wishlists" className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100" aria-label="Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
              </svg>
              {totalFavoriteItems > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{totalFavoriteItems}</span>
              )}
            </Link>

            <Link href="/productcart" className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5" />
                <path d="M5 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4m6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4" transform="scale(.8) translate(1 -5)" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{totalItems}</span>
              )}
            </Link>

            <button
              onClick={() => setShowProfilePopup(true)}
              className="rounded-full p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-slate-200 bg-white md:block" ref={megaRef}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2">
            {desktopLinks.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${pathname === item.link ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {item.name}
              </Link>
            ))}

            <button
              onClick={() => setIsMegaOpen((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isMegaOpen ? "bg-sky-700 text-white" : "text-slate-700 hover:bg-slate-100"}`}
            >
              Categories
            </button>
          </nav>

          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
            {loading ? "Loading account" : user ? `Welcome, ${user.name || "Customer"}` : "Guest mode"}
          </p>
        </div>

        {isMegaOpen && (
          <div className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Shop by category</p>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {(categories.length ? categories : ["Coolers", "Kitchen Sets", "Souvenirs", "Bags"]).map((category) => (
                    <Link
                      key={category}
                      href={`/products?category=${encodeURIComponent(category)}`}
                      onClick={() => setIsMegaOpen(false)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.14em] text-sky-300">Hot Collection</p>
                <h3 className="mt-2 text-xl font-bold">Adventure Cooler Series</h3>
                <p className="mt-2 text-sm text-slate-300">Built for long ice retention, travel durability, and daily reliability.</p>
                <Link
                  href="/products"
                  onClick={() => setIsMegaOpen(false)}
                  className="mt-4 inline-block rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-900 hover:bg-sky-400"
                >
                  Shop now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`fixed inset-0 z-[80] bg-black/40 transition ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setIsMenuOpen(false)}>
        <aside
          className={`h-full w-80 bg-white shadow-2xl transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <Logo width={"w-10"} height={"h-10"} fontSize={"text-xl"} />
            <button onClick={() => setIsMenuOpen(false)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Close menu">
              ✕
            </button>
          </div>

          <div className="space-y-5 px-4 py-4">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </form>

            <nav className="space-y-1">
              {desktopLinks.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${pathname === item.link ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {(categories.length ? categories : ["Coolers", "Kitchen", "Bags", "Souvenirs"]).slice(0, 8).map((category) => (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
              <Link href="/wishlists" onClick={() => setIsMenuOpen(false)} className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700">
                Wishlist ({totalFavoriteItems})
              </Link>
              <Link href="/productcart" onClick={() => setIsMenuOpen(false)} className="rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white">
                Cart ({totalItems})
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Header;

const LogoutPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Logged out</h2>
        <p className="mt-2 text-sm text-slate-600">Thanks for visiting Dunkab Ventures.</p>
        <button onClick={onClose} className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
          Close
        </button>
      </div>
    </div>
  );
};

const ProfilePopup = ({ user, onClose, onLogout, router }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>

        {user ? (
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Account</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold">Name:</span> {user.name || "N/A"}</p>
              <p><span className="font-semibold">Email:</span> {user.email || "N/A"}</p>
            </div>
            <button
              onClick={onLogout}
              className="mt-6 w-full rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to Dunkab</h2>
            <p className="mt-2 text-sm text-slate-600">Login or create an account to manage orders and wishlist.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  router.push("/authentication");
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push("/authentication?signup=true");
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
