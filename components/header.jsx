"use client";
import Link from "next/link";
import Logo from "./Logo"
import Navbar from "./nav";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const Header = () => {
  const pathname = usePathname()
  // save the current path to session storage

  useEffect(() => {
    {Navbar.map((item) => {
      if (pathname === item.link) {
        sessionStorage.setItem("currentPath", item.link);
      }
    })
  }})
  return (
    <header className="">
      
      <div className=" bg-white shadow-lg   px-4 py-2 flex justify-between items-center">
        <div className="flex">
        <div className="flex items-center gap-1">
        <Logo width={'w-15'} height={'h-20'} />
        <h1 className="text-2xl font-bold">Dunkab</h1>
        </div>

        <div>
        {/* routes */}
        
        </div>

        </div>
       <div className="md:flex hidden items-center gap-1">
       {Navbar.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className={`${pathname === item.link ? "text-red-600" : "text-gray-700"} hover:text-red-600 px-4 py-2`}
          >
            {item.icon}
          </Link>
       ))}
       </div>
       <div className="md:hidden flex items-center">
       <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
</svg>
       </div>
      </div>
    </header>
  );
};

export default Header;
