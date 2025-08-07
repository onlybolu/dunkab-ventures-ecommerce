"use client";

import { useCart } from "../../../../context/cartContext";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../../components/Logo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();
   const pathname = usePathname();
    const [previousPath, setPreviousPath] = useState(null);
  
    useEffect(() => {
      const lastPath = sessionStorage.getItem("currentPath");
      if (lastPath) setPreviousPath(lastPath);
      sessionStorage.setItem("lastPath", pathname);
    }, [pathname]);

    const formatPathname = (path) => {
        if (path === "/") return "Home";
        return path
          .split("/")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" / ");
      };

  return (
    <div className="">
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
                      <>
                        <Link href={previousPath} className="hover:underline text-3xl font-semibold text-gray-700">
                          {formatPathname(previousPath)}
                        </Link>
                        {/* <span>{">"}</span> */}
                      </>
                    )}
                    {/* <span>{formatPathname(pathname)}</span> */}
                  </div>
                  <div className="text-gray-600 flex gap-2">
                    <p className="font-medium">Home</p>
                    <p className="font-bold text-black">{">"}</p>
                    <p className="font-medium">Cart</p>
                  </div>
                </div>
              </div>



              <div className="p-4 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center shadow-xl p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">

                <Link href={`/product/${item._id}`} className="flex items-center gap-4 hover:underline">
  <Image
    src={item.image}
    alt={item.title}
    width={100}
    height={100}
    className="w-24 h-24 object-cover rounded-lg"
  />
  <div>
    <h2 className="font-semibold">{item.title}</h2>
    <p>₦{item.price.toLocaleString()}</p>
    <p>Qty: {item.quantity}</p>
  </div>
</Link>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="red" className="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg>
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={clearCart}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Clear Cart
          </button>
        </>
      )}

      <Link href="/products" className="block mt-4 text-blue-500">
        Continue Shopping
      </Link>
              </div>
    </div>
  );
}
