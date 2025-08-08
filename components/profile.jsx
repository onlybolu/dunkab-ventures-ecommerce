"use client";
import { useRouter } from "next/navigation";
import { useCart } from "../context/cartContext";

const Profile = ({ hidden, md }) => {
  const router = useRouter();
  const { cartItems } = useCart(); // fixed: use cartItems directly

  // Total price
  const total = cartItems.length > 0
    ? cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0)
    : 0;

  // Total number of items
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0); //  handles quantity

  const handleCartClick = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    router.push("/productcart");
  };

  return (
    <div
      className={`${hidden ? "block" : "hidden"} ${
        md ? "md:block" : "md:hidden"
      } relative`}
      onClick={handleCartClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"
        fill="currentColor"
        className="bi bi-cart4"
        viewBox="0 0 16 16"
      >
        <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </div>
  );
};

export default Profile;
