"use client";
import Link from "next/link";
import Logo from "./Logo";
import Navbar from "./nav";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Profile from "./profile";
import { useCart } from "../context/cartContext";

const Header = () => {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const router = useRouter();

  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const [newAddress, setNewAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setNewAddress(parsedUser.address || "");
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

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

  
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    router.push(`/products?${params.toString()}`);
    setIsMenuOpen(false)
    setSearchTerm("");
  };

  const handleSaveAddress = async () => {
    if (!newAddress.trim()) {
      setSaveMessage("Please enter a valid address.");
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
        const updatedUser = { ...user, address: newAddress };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setSaveMessage("Address updated successfully!");
      } else {
        setSaveMessage(data.message || "Failed to update address.");
      }
    } catch {
      setSaveMessage("Error saving address.");
    }
    setIsSaving(false);
  };

  const handleCategoriesClick = () => {
    setShowCategories(true);
    setShowUserDetails(false);
  };

  const handleMyAccountClick = () => {
    setShowUserDetails(true);
    setShowCategories(false);
  };

  const handleBackToMenu = () => {
    setShowUserDetails(false);
    setShowCategories(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("currentPath");
    window.location.href = "/";
  };

  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <header>
      {/* Top bar */}
      <div className="bg-white shadow-lg px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div className="md:hidden flex items-center">
          <button
              onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle menu visibility
              className="focus:outline-none"
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
          <Logo width={"w-15"} height={"h-20"} fontSize={"text-2xl"} />
        </div>

        <div className="md:flex hidden items-center gap-3">
          {Navbar.map((item) => (
            <Link key={item.id} href={item.link}
              className={`${pathname === item.link ? "text-red-600" : "text-gray-700"} hover:text-red-600 px-4 py-2`}>
              {item.icon}
            </Link>
          ))}
          <Profile hidden={false} md={true} />
          <button onClick={handleLogout}>logout</button>
        </div>

        {user?.email && (
          <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600 font-medium">
            {user?.email}
          </button>
        )}
        <Profile hidden={true} md={false} />
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 left-0 h-full w-full bg-black/50 transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className={`fixed top-0 left-0 h-full w-full bg-white shadow-2xl transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          {/* Menu header */}
          <div className="flex shadow-2xl items-center justify-between px-3 py-6">
            {showUserDetails || showCategories ? (
              <button onClick={handleBackToMenu} className="flex items-center gap-1 text-gray-700 hover:text-red-500">
                ← Back
              </button>
            ) : (
              <Logo width={"w-15"} height={"h-20"} />
            )}
            <button onClick={() => setIsMenuOpen(false)}>
              ✕
            </button>
          </div>

            {/* video */}
            <div>
                      <video
                        src="/ads.mp4"
                        loop
                        muted
                        autoPlay
                        playsInline
                        className="w-full h-60 object-cover mt-4 rounded-lg shadow-md"
                      ></video>
                    </div>
          {/* Search */}
          <form onSubmit={handleSearch} className="pt-6 px-4">
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full border outline-0 border-gray-400 rounded-lg px-3 py-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </form>

          {/* Menu Content */}
          <div className="flex flex-col gap-4 h-[50vh] pb-9 overflow-y-scroll mt-5 px-4">
            {showUserDetails ? (
              <div className="bg-white rounded-md py-3 px-4">
                <h2 className="text-lg font-bold mb-4">My Account</h2>
                <p className="mb-1"><strong>Name:</strong> {user?.name}</p>
                <p className="mb-4"><strong>Email:</strong> {user?.email}</p>
                <h3 className="text-lg font-bold mt-4 mb-2">Address</h3>
                <input type="text" placeholder="Enter your address"
                  className="w-full border outline-0 border-gray-300 rounded-lg px-3 py-2 mb-3 focus:border-red-500"
                  value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                <button onClick={handleSaveAddress}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full"
                  disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Address"}
                </button>
                {saveMessage && (
                  <p className={`mt-2 text-sm ${saveMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {saveMessage}
                  </p>
                )}
              </div>
            ) : showCategories ? (
              <ul className="flex flex-col gap-4 items-start">
                {categories.map((category, index) => (
                  <li key={index} className="w-full border-b border-gray-300">
                    <Link href={`/products?category=${category}`} className="flex gap-2 w-full px-4 py-2 text-gray-700 hover:text-red-600">
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-white rounded-md py-3">
                <ul className="flex flex-col gap-4 items-start">
                  {Navbar.map((item) => (
                    <li key={item.id} className="w-full border-b border-gray-300">
                      {item.name === "Categories" ? (
                        <div onClick={handleCategoriesClick}
                          className="flex gap-2 w-full px-4 py-2 text-gray-700 hover:text-red-600 cursor-pointer">
                          {item.icon} {item.name}
                        </div>
                      ) : (
                        <Link href={item.link}
                          className={`flex gap-2 w-full px-4 py-2 ${pathname === item.link ? "text-red-600" : "text-gray-700"} hover:text-red-600`}
                          onClick={() => setIsMenuOpen(false)}>
                          {item.icon} {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                <div  onClick={handleMyAccountClick} className="flex items-center justify-between pb-4 px-4 border-b pt-5 border-gray-300 cursor-pointer">
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
                                  <p>My Account:</p>
                                  <button
                                   
                                    className="text-sm cursor-pointer text-gray-500"
                                  >
                                    {user?.name || "Guest"}
                                  </button>
                                </div>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                fill="gray"
                                className="bi bi-arrow-right"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                                />
                              </svg>
                            </div>

                            <div className="px-2 pt-6 bg-white rounded-md flex flex-col gap-7">
                            <div className="px-2">
                              <Link
                                href="/productcart"
                                className="flex items-center justify-between border-b pb-2 cursor-pointer border-gray-300"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="flex items-center gap-2 text-gray-700">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    fill="green"
                                    className="bi bi-cart4"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
                                  </svg>
                                  <p>Cart</p>
                                </div>
                                <p className="text-gray-400">{totalItems} items</p>
                              </Link>
                            </div>
                            <div className="px-2">
                              <Link
                                href={"/"}
                                className="flex items-center justify-between pb-2 border-b cursor-pointer border-gray-300"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="flex items-center gap-2 text-gray-700">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    fill="red"
                                    className="bi bi-suit-heart-fill"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                                  </svg>
                                  <p>Wishlist</p>
                                </div>
                                <p className="text-gray-400">0 items</p>
                              </Link>
                            </div>
                          </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
