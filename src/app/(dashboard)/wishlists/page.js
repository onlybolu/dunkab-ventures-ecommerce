"use client";

import { useFavorite } from "../../../../context/FavoriteContext";
import { useCart } from "../../../../context/cartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function WishlistPage() {
    const { favorite, handleFavourite, loading: favoriteLoading } = useFavorite();
    const { addToCart } = useCart();
    const router = useRouter();

    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch full product details for each item in the wishlist
    useEffect(() => {
        const fetchProducts = async () => {
            if (!favorite || favorite.length === 0) {
                setWishlistProducts([]);
                setProductsLoading(false);
                return;
            }

            setProductsLoading(true);
            setError(null);

            try {
                const productPromises = favorite.map(async (productId) => {
                    const res = await fetch(`/api/products/${productId}`);
                    if (!res.ok) throw new Error(`Failed to fetch product ${productId}`);
                    return res.json();
                });
                const productsData = await Promise.all(productPromises);
                setWishlistProducts(productsData);
            } catch (err) {
                console.error("Error fetching wishlist products:", err);
                setError("Failed to load product details.");
                setWishlistProducts([]);
            } finally {
                setProductsLoading(false);
            }
        };

        if (!favoriteLoading) {
            fetchProducts();
        }
    }, [favorite, favoriteLoading]);

    const handleAddToCart = (product) => {
        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.title} added to cart!`);
    };

    if (favoriteLoading || productsLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <h1 className="text-xl font-bold text-red-600">{error}</h1>
            </div>
        );
    }
    
    return (
        <main className="bg-gray-50 min-h-screen">
            <ToastContainer position="top-center" autoClose={3000} newestOnTop={true} />

            <div className="bg-white py-8 md:py-12 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
                        <span className="text-gray-400">/</span>
                        <span className="font-semibold text-gray-700">My Wishlist</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">My Wishlist ({wishlistProducts.length})</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {wishlistProducts.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty.</h2>
                        <p className="text-gray-600 text-lg mb-6">Start browsing our products and add your favorites!</p>
                        <Link href="/products" className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistProducts.map((product) => (
                            <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 transform hover:-translate-y-1">
                                <Link href={`/product/${product._id}`} className="block relative w-full h-48">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className="transition-opacity duration-300"
                                    />
                                </Link>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.title}</h3>
                                    <p className="text-md text-blue-600 mt-1 font-semibold">
                                        ₦{product.price.toLocaleString()}
                                    </p>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleFavourite(product._id)}
                                            className="w-full border border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Remove
                                        </button>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}