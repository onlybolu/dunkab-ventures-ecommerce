"use client";
import Link from "next/link";
import Logo from "./Logo";
import Navbar from "./nav";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCart } from "../context/cartContext";
import Profile from "./profile";

const Header = () => {
  const pathname = usePathname();
  const { cartItems, clearCartLocalOnly, user } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // New state for mobile search
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (user && user.address) {
      setNewAddress(user.address);
    } else if (user === null) {
      setNewAddress("");
    }
  }, [user]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Effect to focus the search input when the mobile search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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
    clearCartLocalOnly();
    localStorage.removeItem("user");
    sessionStorage.removeItem("currentPath");
    setShowLogoutPopup(true);
    setShowProfilePopup(false);
    router.push("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    router.push(`/products?${params.toString()}`);
    setIsMenuOpen(false);
    setIsSearchOpen(false); // Close mobile search after submission
    setSearchTerm("");
  };

  const handleSaveAddress = async () => {
    if (!newAddress.trim()) {
      setSaveMessage("Please enter a valid address.");
      return;
    }
    if (!user || !user.email) {
      setSaveMessage("Please log in to save your address.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/update-address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, address: newAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage("Address updated successfully!");
      } else {
        setSaveMessage(data.message || "Failed to update address.");
      }
    } catch {
      setSaveMessage("Error saving address.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoriesClick = () => {
    setShowCategories(true);
    setShowUserDetails(false);
  };

  const handleMyAccountClick = () => {
    setShowProfilePopup(true);
    setIsMenuOpen(false);
  };

  const handleBackToMenu = () => {
    setShowUserDetails(false);
    setShowCategories(false);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Toggle mobile search visibility
  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <header className="sticky top-0 z-50">
      {showLogoutPopup && <LogoutPopup onClose={() => setShowLogoutPopup(false)} />}
      {showProfilePopup && (
        <ProfilePopup
          user={user}
          onClose={() => setShowProfilePopup(false)}
          onLogout={handleLogout}
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          handleSaveAddress={handleSaveAddress}
          isSaving={isSaving}
          saveMessage={saveMessage}
          router={router}
        />
      )}

      {/* Top bar */}
      <div className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                className="bi bi-list"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                />
              </svg>
            </button>
          </div>
          <Link href="/" className="flex-shrink-0">
            <Logo width={"w-15"} height={"h-20"} fontSize={"text-2xl"} />
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-grow max-w-md ml-8">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-l-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Submit search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.085.12l3.96 3.96a.5.5 0 0 0 .707-.707l-3.96-3.96a.5.5 0 0 0-.12-.085zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </button>
          </form>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-4">
            {Navbar.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className={`${pathname === item.link ? "text-blue-600 font-semibold" : "text-gray-700"} hover:text-blue-600 px-3 py-2 rounded-md transition-colors flex flex-col items-center justify-center`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Profile hidden={true} md={true} />
            <button
              onClick={() => setShowProfilePopup(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors flex flex-col items-center justify-center"
              aria-label="User profile and account settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
              </svg>
              <span className="text-xs mt-1">{user ? "Account" : "Login"}</span>
            </button>
          </div>
        </div>

        {/* Mobile-only Icons (Search, Cart, Profile) */}
        <div className="md:hidden flex items-center gap-3">
          {/* New Mobile Search Button */}
          <button
            onClick={toggleMobileSearch}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.085.12l3.96 3.96a.5.5 0 0 0 .707-.707l-3.96-3.96a.5.5 0 0 0-.12-.085zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
          </button>
          {/* Cart Icon */}
          <Link href="/productcart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="View shopping cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-cart4" viewBox="0 0 16 16">
              <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          {/* Mobile Profile Icon */}
          <button
            onClick={() => setShowProfilePopup(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="User profile and account settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div
        className={`fixed inset-x-0 top-0 pt-4 px-4 pb-3 bg-white shadow-md z-[60] transform transition-transform duration-300 ${isSearchOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="flex items-center justify-between">
          <form onSubmit={handleSearch} className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-md pr-12 pl-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search products"
                ref={searchInputRef}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-gray-500 hover:text-gray-700"
                aria-label="Submit search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.085.12l3.96 3.96a.5.5 0 0 0 .707-.707l-3.96-3.96a.5.5 0 0 0-.12-.085zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </button>
            </div>
          </form>
          <button
            onClick={toggleMobileSearch}
            className="ml-3 text-gray-500 hover:text-gray-800 p-2 rounded-md transition-colors"
            aria-label="Close search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (Side Drawer) */}
      <div className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
           onClick={() => setIsMenuOpen(false)}>
        <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
             onClick={(e) => e.stopPropagation()}>
          
          {/* Menu header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            {showUserDetails || showCategories ? (
              <button onClick={handleBackToMenu} className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                </svg>
                Back
              </button>
            ) : (
              <div className="flex w-full items-center justify-between">
                      <Logo width={"w-15"} height={"h-20"} />
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors"
                        aria-label="Close mobile menu"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          fill="currentColor"
                          className="bi bi-x"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                          />
                        </svg>
                      </button>
                    </div>
            )}
          </div>

          {/* Mobile Search has been moved to its own overlay, so we'll remove it from the menu */}
          
          {/* Mobile Menu Content - Scrollable */}
          <div className="flex flex-col flex-grow overflow-y-auto pb-4">
            {/* My Account section in mobile menu now triggers ProfilePopup */}
            <button  
              onClick={handleMyAccountClick}
              className="flex items-center justify-between p-4 border-y border-gray-200 mt-auto text-left w-full hover:bg-gray-50 transition-colors"
            >
              <div className="text-gray-700 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="currentColor"
                  className="bi bi-person"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                </svg>
                <div className="flex items-center gap-1">
                  <p>Account:</p>
                  <span className="text-sm text-gray-500">
                    {/* {user?.email || "Guest"} */}
                  </span>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="gray"
                className="bi bi-chevron-right"
                viewBox="0 0 16 16"
              >
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
              </svg>
            </button>

            <ul className="flex flex-col">
              {Navbar.map((item) => (
                <li key={item.id} className="border-b border-gray-100 last:border-b-0">
                  {item.name === "Categories" ? (
                    <button onClick={handleCategoriesClick}
                      className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left">
                      {item.icon} {item.name}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right ml-auto" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                      </svg>
                    </button>
                  ) : (
                    <Link href={item.link}
                      className={`flex items-center gap-2 w-full px-4 py-3 ${pathname === item.link ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"} hover:bg-gray-50 hover:text-blue-600 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}>
                      {item.icon} {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="px-4 py-4 flex flex-col gap-4 border-t border-gray-200 mt-auto">
              <Link
                href="/productcart"
                className="flex items-center justify-between text-gray-700 hover:bg-gray-50 hover:text-blue-600 p-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    fill="currentColor"
                    className="text-blue-600"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
                  </svg>
                  <p>Cart</p>
                </div>
                <p className="text-gray-500 text-sm font-medium">{totalItems} items</p>
              </Link>
            
              <Link
                href={"/"}
                className="flex items-center justify-between text-gray-700 hover:bg-gray-50 hover:text-blue-600 p-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    fill="currentColor"
                    className="text-red-500"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                  </svg>
                  <p>Wishlist</p>
                </div>
                <p className="text-gray-500 text-sm font-medium">0 items</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

// Custom Logout Popup Component (remains the same)
const LogoutPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-70 flex items-center justify-center z-[1000]">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full border border-gray-200 relative overflow-hidden">
        <img
          src="https://placehold.co/400x200/e0e0e0/555555?text=Thank+You+for+Shopping!"
          alt="Thank You Ad"
          className="w-full h-32 object-cover rounded-t-lg mb-4"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x200/e0e0e0/555555?text=Image+Failed+to+Load"; }}
        />

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Logout Successful!
        </h2>
        <p className="text-base text-gray-700 mb-6">
          Thank you for patronizing Dunkab Ventures. We hope to see you again soon! 👋
        </p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// NEW: Profile Popup Component
const ProfilePopup = ({ user, onClose, onLogout, newAddress, setNewAddress, handleSaveAddress, isSaving, saveMessage, router }) => {
  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-70 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-3 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors" aria-label="Close profile popup">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
        </button>

        {user ? (
          <div>
            <h2 className="text-2xl text-gray-800 mb-4">My Account</h2>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">Name: {user.name || 'N/A'}</p>
              <p className="text-gray-700">Email: {user.email || 'N/A'}</p>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Delivery Address</h3>
              <input 
                type="text" 
                placeholder="Enter your address"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                value={newAddress} 
                onChange={(e) => setNewAddress(e.target.value)} 
              />
              <button 
                onClick={handleSaveAddress}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 w-full font-semibold"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Address"}
              </button>
              {saveMessage && (
                <p className={`mt-2 text-sm ${saveMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {saveMessage}
                </p>
              )}
            </div>
            <button
              onClick={onLogout}
              className="w-full border border-gray-500 text-gray-700 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 font-semibold"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Dunkab Ventures!</h2>
            <p className="text-gray-700 mb-6">Login or sign up to manage your orders, wishlist, and more.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { onClose(); router.push("/authentication"); }}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                Login
              </button>
              <button 
                onClick={() => { onClose(); router.push("/authentication?signup=true"); }}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors duration-200 font-semibold"
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