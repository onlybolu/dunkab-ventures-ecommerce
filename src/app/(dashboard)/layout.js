"use client"
import { Suspense } from "react";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import Middow from "../../../components/middow";
import { FavoriteProvider } from "../../../context/FavoriteContext";
import Script from "next/script";



export default function RootLayout({ children }) {
  return (
    <div>
      <div className="">
        <Middow />
        <div className="sticky top-0 z-100">
            <Header />
        </div>
        <FavoriteProvider>
        <Script src="https://checkout.flutterwave.com/v3.js" strategy="beforeInteractive" />
        <Suspense fallback={<div className="w-full h-screen">Loading.......</div>}>

        {children}
        </Suspense>
        </FavoriteProvider>
        <div className="flex flex-col h-full justify-end">
        <Footer />
        </div>
      </div>
    </div>
  );
}
