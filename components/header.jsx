"use client";
import Link from "next/link";
import Logo from "./Logo";
import Navbar from "./nav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle the mobile menu

  // Save the current path to session storage
  useEffect(() => {
    Navbar.map((item) => {
      if (pathname === item.link) {
        sessionStorage.setItem("currentPath", item.link);
      }
    });
  }, [pathname]);

  return (
    <header className="">
      <div className="bg-white shadow-lg px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Logo width={"w-15"} height={"h-20"} />
          <h1 className="text-2xl font-bold">Dunkab</h1>
        </div>

        {/* Desktop Navbar */}
        <div className="md:flex hidden items-center gap-1">
          {Navbar.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className={`${
                pathname === item.link ? "text-red-600" : "text-gray-700"
              } hover:text-red-600 px-4 py-2`}
            >
              {item.icon}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
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
      </div>

      {/* Mobile Menu */}
      <div
      
      className={`fixed top-0 right-0 h-full w-full bg-black/50 shadow-2xl transform transition-transform duration-300 ${
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsMenuOpen(false)} // Close menu button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
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
        <ul className="flex flex-col gap-4 items-start pt-15 px-4">
          {Navbar.map((item) => (
            <li key={item.id} className="w-full">
              <Link
                href={item.link}
                className={`flex gap-2 w-full px-4 py-2 ${
                  pathname === item.link ? "text-red-600" : "text-gray-700"
                } hover:text-red-600`}
                onClick={() => setIsMenuOpen(false)} // Close menu on link click
              >
                {item.icon} {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </header>
  );
};

export default Header;
