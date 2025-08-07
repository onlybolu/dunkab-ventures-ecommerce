"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import Img1 from "../../../public/img1.png";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1); 
  const PRODUCTS_PER_PAGE = 10; 

  const router = useRouter();


  const handleProductView = (e) => {
    e.preventDefault();
    const productId = e.currentTarget.getAttribute("data-id");
    router.push(`/product/${productId}`);

  }

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (query) params.append("q", query);
      if (brand !== "all") params.append("brand", brand);
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
    fetchProducts();
  }, [query, brand, minPrice, maxPrice, page]);

  useEffect(() => {
    Aos.init({
      delay: 100,
      duration: 700,
      once: false,
    });
  }, []);

  return (
    <div className="text-gray-700">
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row lg:flex-row justify-evenly items-center py-10 text-white bg-gray-600 md:h-[70vh]">
        <div data-aos="zoom-in-right" className="flex flex-col gap-5">
          <h1 className="text-4xl font-medium w-72">Island breeze 28 quarts</h1>
          <Link href="/products">
            <div className="flex flex-col gap-1">
              <p className="font-medium">Shop Now</p>
              <hr className="w-20" />
            </div>
          </Link>
        </div>
        <Image
          data-aos="zoom-in-left"
          className="w-96 xl:w-130"
          src={Img1}
          alt="cooler"
          width={1000}
          height={100}
        />
      </section>

      {/* Features Section */}
      <section className="flex justify-evenly flex-col md:flex-row lg:flex-row pt-14 pb-20 bg-[#dbc8c8] text-gray-700">
        {[1, 2].map((i) => (
          <div key={i} className="relative flex items-end">
            <div
              data-aos="zoom-in-up"
              className="absolute bottom-5 md:bottom-12 lg:bottom-12 left-10 flex flex-col gap-3 z-10"
            >
              <h1 className="text-xl font-medium">Fisti Cup</h1>
              <Link href="/products">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">View More</p>
                  <hr className="w-20 border-gray-800" />
                </div>
              </Link>
            </div>
            <Image
              data-aos="zoom-in-down"
              src="/img1.png"
              alt="Fisti Cup"
              width={10000}
              height={100}
              className="w-96 pl-15 pb-4"
            />
          </div>
        ))}
      </section>

      {/* Products Section */}
      <section className="flex flex-col gap-10 py-14">
        <div className="flex flex-col gap-16">
          <div
            data-aos="zoom-in-down"
            className="flex flex-col gap-2 items-center"
          >
            <h1 className="text-3xl font-medium">Top Picks For You</h1>
            <p className="text-[#9f9f9f] font-medium text-center px-8">
              Explore our wide range of products designed to meet your needs.
            </p>
          </div>

          <div
            data-aos="zoom-in-up"
            className="px-10 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-x-10 gap-y-10"
          >
            {error && (
              <div className="text-red-600 text-center mb-6 font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center w-full flex items-center justify-center text-gray-600 text-xl">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center w-full flex items-center justify-center text-gray-600 text-xl">
                No products found
              </div>
            ) : (
              products.slice(0, 4).map((product) => (
                <div
                  key={product._id}
                  className="overflow-hidden px-3 py-3 rounded-lg shadow-2xl pb-5 hover:shadow-4xl cursor-pointer"
                  data-id={product._id}
                  onClick={handleProductView}
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={300}
                    height={300}
                    className="w-full h-52 border boder-gray-300 object-cover rounded-lg mb-4"
                  />
                  <div className="flex flex-col items-start gap-2 pl-2 bg-white pt-3">
                  <h2 className="text-xl font-semibold">{product.title}</h2>
                  <p className="text-gray-600 mt-2">₦{product.price}</p>
                  {/* <Link
                    href={`/product/${product._id}`}
                    className="text-blue-500 hover:underline mt-2 block"
                  >
                    View Details
                  </Link> */}
                    </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Link href="/products">
        <div
        data-aos="fade-up"
        className="flex flex-col items-center gap-1"
        >
          <p className="font-medium">View More</p>
          <hr className="w-20 border-gray-800" />
        </div>
        </Link>
      </section>


      <section className="flex justify-evenly flex-col md:flex-row items-center bg-gray-700 text-white py-20">
        <Image
        src={"/img1.png"}
        data-aos="fade-right"
        className="w-96 px-5"
        alt="cooler"
        width={1000}
        height={100}
        />
        <div className="flex flex-col gap-5">
            <div data-aos="fade-down" className="flex flex-col items-center">
              <p className="font-medium">New Arrivals</p>
              <h1 className="text-3xl font-medium">Explore Our Latest Products</h1>
            </div>
            <div className="flex justify-center">
              <Link href="/products">
                <button data-aos="fade-up" className="rounded border cursor-pointer py-2 px-4 text-[10px] w-28">
                  Shop Now
                </button>
              </Link>
            </div>
        </div>
      </section>

    </div>
  );
}
