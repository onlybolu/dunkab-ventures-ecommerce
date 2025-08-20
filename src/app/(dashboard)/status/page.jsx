"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "../../../../context/cartContext";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Processing your payment...");

  const hasClearedCart = useRef(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("status");

    if (paymentStatus === "successful") {
      clearCart();
      hasClearedCart.current = true;
      setStatus("successful");
      setMessage("Payment Successful! Your order has been placed.");
      // toast.success("Your payment was successful!");
    } else if (paymentStatus === "cancelled" || paymentStatus === "failed") {
      setStatus("failed");
      setMessage("Payment Failed. Please try again.");
      // toast.error("Payment failed. Please check your details and try again.");
    }
  }, [searchParams, clearCart]); 

  const getIcon = () => {
    if (status === "successful") {
      return (
        <svg className="w-20 h-20 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      );
    } else if (status === "failed") {
      return (
        <svg className="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
        </svg>
      );
    } else {
      return (
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
      );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={5000} newestOnTop={true} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full"
      >
        <div className="flex justify-center mb-6">{getIcon()}</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{message}</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your business. We appreciate your patience.
        </p>
        <div className="space-y-3">
          {status === "successful" ? (
            <Link href="/orders" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
              View Your Orders
            </Link>
          ) : (
            <Link href="/checkout" className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
              Try Again
            </Link>
          )}
          <Link href="/" className="block w-full text-gray-600 hover:text-gray-800 font-semibold py-3">
            Go to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}