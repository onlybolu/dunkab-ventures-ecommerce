"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { FavoriteContext } from "../../../../../context/FavoriteContext";
import { useCart } from "../../../../../context/cartContext";
import { toast, ToastContainer } from "react-toastify";

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(1)

  const handleQuantityChange = (newCount) => {
    if (newCount < 1) return;
    setCount(newCount);
  };


  const handleAddToCart = async () => {
    try {
      // Client side update
      addToCart({ ...product, quantity: count });
      toast.success("Product added to cart!");

      // Get user session (or replace with your own userId logic)
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (!session?.user?._id) {
        toast.error("You must be logged in to save cart.");
        return;
      }

      const userId = session.user._id;

      // Send to backend
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: product._id,
          quantity: count,
        }),
      });
    } catch (err) {
      console.error("Error saving to cart:", err);
      toast.error("Failed to save cart in database.");
    }
  };

const {favorite, handleFavourite} = useContext(FavoriteContext)
  useEffect(() => {
    async function fetchProductData() {
      try {
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });

        if (!res.ok) {
          setProduct(null);
          return;
        }

        const prod = await res.json();
        setProduct(prod);

        if (prod?.category) {
          const cleanedCategory = encodeURIComponent(prod.category.trim().toLowerCase());
          const relatedRes = await fetch(
            `/api/products?category=${cleanedCategory}&limit=4`,
            { cache: "no-store" }
          );

          let related = [];
          try {
            const json = await relatedRes.json();
            related = Array.isArray(json)
              ? json
              : Array.isArray(json.products)
              ? json.products
              : [];
          } catch (e) {
            related = [];
          }

          const filtered = related.filter(
            (item) => String(item._id) !== String(prod._id)
          );

          setRelatedProducts(filtered);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProductData();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">Loading...</div>
    );

  if (!product) {
    return (
      <h1 className="text-center text-2xl font-semibold text-red-600">
        Product not found
      </h1>
    );
  }

  const images = [product.image, product.image1, product.image2].filter(Boolean);

  const handleBack = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <main className="p-6 mx-auto">
      <ToastContainer/>
      <div>
        <button
          className="bg-blue-600 text-white rounded-md cursor-pointer mb-3 px-4 py-2"
          onClick={handleBack}
        >
          back
        </button>
      </div>

      <div className="md:flex w-full md:gap-10">
        <ImageSwiper images={images} />

        <div className="flex flex-col justify-center md:w-[50%] space-y-4 px-4 py-4 rounded-md">
          <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
          <p className="text-2xl text-gray-500 font-semibold mb-2">
            ₦ {product.price.toLocaleString()}
          </p>
          <p className="text-gray-700 w-full text-wrap">{product.description}</p>
          <p className="text-gray-500">Category: {product.category}</p>
          <div>
            <button onClick={() => handleFavourite(product._id)} className="flex gap-2 items-center">
              {favorite.includes(product._id) ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="red" className="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1"/>
              </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="gray" className="bi bi-heart" viewBox="0 0 16 16">
  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
</svg>
              )}
              <p className="text-gray-400">Add wishlist</p>
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <label htmlFor="quantity" className="text-gray-700 hidden">  
                {" "}
                Quantity{" "}
                </label>
                <div className="px-5 py-2 flex items-center border border-gray-200 rounded">
                  <button
                  type="button"
                  onClick={() => handleQuantityChange(count > 1 ? count - 1 : 1)}
                  className="text-black">
                    &minus;
                    </button>
                  <input
                    type="number"
                    id="quantity"
                    disabled={count >= 7}
                    min="1"
                    max="7"
                    value={count}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="w-16 text-center text-gray-400 border-0 focus:ring-0 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(count < 7 ? count + 1 : 7 )}
                    className="text-black"
                  >
                    +
                  </button>
                </div>
            </div>
          <button
          onClick={handleAddToCart}
          className="bg-blue-600 hover:bg-blue-700 rounded-md py-3 px-6 cursor-pointer text-white transition duration-200">
            Add to Cart
          </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            More like this
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <div
                key={item._id}
                className="border border-gray-300 rounded-lg p-4 shadow-lg hover:shadow-2xl transition"
                onClick={() => router.push(`/product/${item._id}`)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  ₦{item.price.toLocaleString()}
                </p>
                <a
                  href={`/product/${item._id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Product
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ImageSwiper({ images }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const renderMedia = (src, customClass = "") => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
    return isVideo ? (
      <video
        src={src}
        controls
        className={`object-cover rounded-lg shadow-md ${customClass}`}
      />
    ) : (
      <img
        src={src}
        alt="Product Media"
        className={`object-cover rounded-lg shadow-md ${customClass}`}
      />
    );
  };

  return (
    <>
      <div className="md:w-[50%] relative">
        <div onClick={() => setFullscreen(true)} className="cursor-pointer">
          {renderMedia(images[current], "w-full h-[400px]")}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow"
            >
              {"<"}
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow"
            >
              {">"}
            </button>
          </>
        )}

        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === current ? "bg-blue-600 scale-110" : "bg-gray-300"
              }`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 bg-opacity-90 z-150 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-2 right-4 text-white text-2xl"
            onClick={() => setFullscreen(false)}
          >
            ✕
          </button>
          <div
            className="relative max-w-5xl w-full max-h-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMedia(images[current], "w-full max-h-[90vh] mx-auto")}
            {images.length > 1 && (
              <div className="px-4">
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 transform bg-gray-800 px-3 rounded-sm -translate-y-1/2 text-white text-3xl"
                >
                  {"<"}
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 bg-gray-800 px-3 rounded-sm transform -translate-y-1/2 text-white text-3xl"
                >
                  {">"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
