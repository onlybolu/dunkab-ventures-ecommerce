"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFavorite } from "../../../../../context/FavoriteContext";
import { useCart } from "../../../../../context/cartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaHeart, FaRegHeart, FaPlus, FaMinus } from 'react-icons/fa';

export default function ProductPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { addItemToCart, user } = useCart();
    const { favorite, handleFavourite } = useFavorite();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(1);
    const [selectedColor, setSelectedColor] = useState("");
    const [addToCartToast, setAddToCartToast] = useState(false);

    const handleQuantityChange = (newCount) => {
        if (newCount < 1) return;
        setCount(newCount);
    };

    const handleAddToCart = () => {
        if (!user?._id) {
            toast.error("Please log in to add items to your cart.");
            return;
        }

        if (product?.colors?.length > 0 && !selectedColor) {
            toast.error("Please select a color before adding to cart");
            return;
        }

        setAddToCartToast(true);
        addItemToCart({ ...product, selectedColor, quantity: count });
        // toast.success("Product added to cart");
        setTimeout(() => setAddToCartToast(false), 2000);
    };

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

                if (prod?.colors?.length > 0) {
                    setSelectedColor(prod.colors?.[0]);
                }

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
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );

    if (!product) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-red-600">
                    Product not found
                </h1>
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

    return (
        <main className="bg-white min-h-screen">
            <ToastContainer  />
            {addToCartToast &&
             (
                <div className="bg-green-400 fixed top-0 md:top-35 py-2 text-white text-center z-100 md:right-5 md:w-70 w-full ">
                <p>Product added to cart</p>
            </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <button
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        onClick={() => router.back()}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Back
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                    {/* Image Swiper Section */}
                    <div className="md:col-span-1">
                        <ImageSwiper images={images} />
                    </div>

                    {/* Product Details Section */}
                    <div className="flex flex-col justify-center space-y-6 md:col-span-1">
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">{product.title}</h1>
                            <button onClick={() => handleFavourite(product._id)} className="text-gray-600 hover:text-red-500 transition-colors focus:outline-none">
                                {favorite.includes(product._id) ? (
                                    <svg className="w-6 h-6 fill-red-500 stroke-red-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3C9.44 3 11.21 4.23 12 5.09c.79-.86 2.56-2.09 4.5-2.09A5.5 5.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-.318-.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                )}
                            </button>
                        </div>
                        <p className="text-2xl text-blue-600 font-semibold">
                            ₦ {product.price.toLocaleString()}
                        </p>
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        <p className="text-gray-500 font-medium">Category: {product.category}</p>

                        {/* Color selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <p className="text-gray-700 font-semibold mb-3">Select Color:</p>
                                <div className="flex gap-3 flex-wrap">
                                    {product.colors.map((color, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 focus:outline-none ${
                                                selectedColor === color
                                                    ? "border-blue-600 ring-2 ring-blue-200"
                                                    : "border-gray-300"
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                            aria-label={`Select ${color} color`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Add to Cart */}
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(count - 1)}
                                    className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors focus:outline-none"
                                    aria-label="Decrease quantity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path></svg>
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={count}
                                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                                    className="w-16 text-center text-gray-800 font-semibold border-0 bg-white focus:ring-0 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(count + 1)}
                                    className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors focus:outline-none"
                                    aria-label="Increase quantity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-grow bg-blue-500 hover:bg-blue-600 rounded-md py-3 px-6 text-white font-semibold shadow-md transition duration-200 focus-outline-none"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                            More like this
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((item) => (
                                <Link
                                    key={item._id}
                                    href={`/product/${item._id}`}
                                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            className="rounded-t-xl transition-opacity duration-300"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
                                        <p className="text-md text-blue-600 mt-1 font-semibold">
                                            ₦{item.price.toLocaleString()}
                                        </p>
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

    const handlePrev = () => {
        setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const renderMedia = (src, customClass = "") => {
        const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
        return isVideo ? (
            <video src={src} controls className={`object-cover rounded-lg shadow-md ${customClass}`} />
        ) : (
            <img src={src} alt="Product Media" className={`object-cover rounded-lg shadow-md ${customClass}`} />
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
                        <button onClick={handlePrev} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow">{"<"}</button>
                        <button onClick={handleNext} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow">{">"}</button>
                    </>
                )}
                <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${index === current ? "bg-blue-600 scale-110" : "bg-gray-300"}`}
                            onClick={() => setCurrent(index)}
                        />
                    ))}
                </div>
            </div>

            {fullscreen && (
                <div className="fixed inset-0 bg-black/90 z-150 flex items-center justify-center" onClick={() => setFullscreen(false)}>
                    <button className="absolute top-2 right-4 text-white text-2xl" onClick={() => setFullscreen(false)}>✕</button>
                    <div className="relative max-w-5xl w-full max-h-full px-4" onClick={(e) => e.stopPropagation()}>
                        {renderMedia(images[current], "w-full max-h-[90vh] mx-auto")}
                        {images.length > 1 && (
                            <>
                                <button onClick={handlePrev} className="absolute left-4 top-1/2 transform bg-gray-800 px-3 rounded-sm -translate-y-1/2 text-white text-3xl">{"<"}</button>
                                <button onClick={handleNext} className="absolute right-4 top-1/2 bg-gray-800 px-3 rounded-sm transform -translate-y-1/2 text-white text-3xl">{">"}</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}