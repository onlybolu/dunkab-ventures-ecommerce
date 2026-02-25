"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFavorite } from "../../../../../context/FavoriteContext";
import { useCart } from "../../../../../context/cartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { addItemToCart, user } = useCart();
  const { favorite, handleFavourite } = useFavorite();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [showAddedToast, setShowAddedToast] = useState(false);

  const formatPrice = (value) => {
    const parsed =
      typeof value === "number"
        ? value
        : parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed.toLocaleString() : "0";
  };

  const handleQuantityChange = (value) => {
    if (value < 1) return;
    setCount(value);
  };

  const handleAddToCart = () => {
    if (!user?._id) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    if (product?.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color before adding to cart.");
      return;
    }

    addItemToCart({ ...product, selectedColor, quantity: count }, selectedColor);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2200);
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
        if (!res.ok) {
          setProduct(null);
          return;
        }

        const prod = await res.json();
        setProduct(prod);

        if (prod?.colors?.length > 0) {
          setSelectedColor(prod.colors[0]);
        }

        if (prod?.category) {
          const cleanedCategory = encodeURIComponent(prod.category.trim().toLowerCase());
          const relatedRes = await fetch(`/api/products?category=${cleanedCategory}&limit=6`, {
            cache: "no-store",
          });

          let related = [];
          try {
            const json = await relatedRes.json();
            related = Array.isArray(json) ? json : Array.isArray(json.products) ? json.products : [];
          } catch {
            related = [];
          }

          setRelatedProducts(related.filter((item) => String(item._id) !== String(prod._id)).slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <h1 className="text-3xl font-bold text-red-600">Product not found</h1>
      </div>
    );
  }

  const images = [
    product.image,
    product.image1,
    product.image2,
    product.image3,
    product.image4,
    product.image5,
    product.image6,
    product.image7,
    product.image8,
  ].filter(Boolean);

  const isFavorite = favorite.includes(product._id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/35 to-white">
      <ToastContainer />

      {showAddedToast && (
        <div className="fixed right-4 top-24 z-[120] rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          Product added to cart
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500"
          onClick={() => router.back()}
        >
          <span>&larr;</span> Back to shopping
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-6">
            <ImageSwiper images={images} />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Premium Cooler</p>
            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
              <button
                onClick={() => handleFavourite(product._id)}
                className="rounded-full border border-slate-300 p-2 text-slate-600 hover:border-rose-300 hover:text-rose-500"
                aria-label="Toggle favorite"
              >
                {isFavorite ? "❤" : "♡"}
              </button>
            </div>

            <p className="text-3xl font-bold text-slate-900">₦{formatPrice(product.price)}</p>
            <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-slate-500">Category</p>
                <p className="font-semibold text-slate-800">{product.category || "General"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-slate-500">Delivery</p>
                <p className="font-semibold text-slate-800">Fast Dispatch</p>
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">Select Color</p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        selectedColor === color ? "border-sky-600 ring-2 ring-sky-200" : "border-slate-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-slate-300 bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(count - 1)}
                  className="rounded-full px-3 py-1 text-slate-700 hover:bg-slate-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={count}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  className="w-14 bg-transparent text-center text-base font-semibold text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(count + 1)}
                  className="rounded-full px-3 py-1 text-slate-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-sky-700"
              >
                Add to Cart
              </button>
            </div>
          </section>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">You may also like</h2>
              <Link href="/products" className="text-sm font-semibold text-sky-700 hover:text-sky-900">View all</Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item._id}
                  href={`/product/${item._id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-slate-900">{item.title}</h3>
                    <p className="font-bold text-slate-800">₦{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ImageSwiper({ images }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const handlePrev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const renderMedia = (src, customClass = "") => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
    return isVideo ? (
      <video src={src} controls className={`w-full rounded-2xl object-cover ${customClass}`} />
    ) : (
      <img src={src} alt="Product media" className={`w-full rounded-2xl object-cover ${customClass}`} />
    );
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className="relative">
        <div onClick={() => setFullscreen(true)} className="cursor-zoom-in">
          {renderMedia(images[current], "h-[420px]")}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-slate-700 shadow hover:bg-white"
            >
              &lt;
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-slate-700 shadow hover:bg-white"
            >
              &gt;
            </button>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                index === current ? "border-sky-600" : "border-slate-200"
              }`}
              onClick={() => setCurrent(index)}
            >
              <img src={src} alt="Preview" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute right-4 top-4 text-2xl text-white"
            onClick={() => setFullscreen(false)}
          >
            ✕
          </button>
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {renderMedia(images[current], "max-h-[85vh]")}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-slate-900/70 px-3 py-2 text-xl text-white"
                >
                  &lt;
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-slate-900/70 px-3 py-2 text-xl text-white"
                >
                  &gt;
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
