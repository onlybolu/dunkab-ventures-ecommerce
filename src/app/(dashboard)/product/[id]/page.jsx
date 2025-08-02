"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductData() {
      try {
        const res = await fetch(`/api/products/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setProduct(null);
          return;
        }

        const prod = await res.json();
        setProduct(prod);

        const categoryEncoded = encodeURIComponent(prod?.category || "");
        const relatedRes = await fetch(
          `/api/products?category=${categoryEncoded}&limit=4`,
          {
            cache: "no-store",
          }
        );

        const related = relatedRes.ok ? await relatedRes.json() : [];
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProductData();
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  if (!product) {
    return (
      <h1 className="text-center text-2xl font-semibold text-red-600">
        Product not found
      </h1>
    );
  }

  const images = [product.image, product.image1, product.image2].filter(Boolean);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="md:flex w-full md:gap-10">
        {/* Product Image Swiper-like section */}
        <ImageSwiper images={images} />

        <div className="flex flex-col justify-center md:w-[50%] space-y-4 px-4 py-4 rounded-md">
          <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
          <p className="text-xl text-gray-700 mb-2">
            ₦{(product.price).toLocaleString()}
          </p>
          <p className="text-gray-500">{product.description}</p>
          <button className="bg-blue-600 hover:bg-blue-700 rounded-md py-3 px-6 cursor-pointer text-white transition duration-200">
            Add to Cart
          </button>
        </div>
      </div>

      {relatedProducts.length > 1 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            More like this
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts
              .filter((item) => item._id !== product._id)
              .map((item) => (
                <div
                  key={item._id}
                  className="border rounded-lg p-4 shadow hover:shadow-md transition"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    ₦{(item.price).toLocaleString()}
                  </p>
                  <a
                    href={`/products/${item._id}`}
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

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="md:w-[50%] relative">
      <img
        src={images[current]}
        alt={`Product Image ${current + 1}`}
        className="w-full h-[400px] object-cover rounded-lg shadow-md transition duration-500 ease-in-out"
      />

      {/* Show navigation only if there's more than one image */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow"
          >
            ◀
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow"
          >
            ▶
          </button>
        </>
      )}

      {/* Dots indicator */}
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
  );
}