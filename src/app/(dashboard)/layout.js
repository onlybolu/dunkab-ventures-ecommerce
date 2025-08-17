import { Suspense } from "react";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import Middow from "../../../components/middow";
import { FavoriteProvider } from "../../../context/FavoriteContext";
import Script from "next/script";
import MessagingDashboard from "../../../components/MessagingDashboard"; // Import the new component

export default function RootLayout({ children }) {
  return (
    <div>
      <div className="">
        <Middow />
        <Suspense fallback={
          <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        }>
          <div className="sticky top-0 z-100">
            <Header />
          </div>
          <FavoriteProvider>
            <Script src="https://checkout.flutterwave.com/v3.js" strategy="beforeInteractive" />
            {children}
          </FavoriteProvider>
        </Suspense>
        <div className="flex flex-col h-full justify-end">
          <Footer />
        </div>
      </div>
      {/* Messaging Dashboard added here, outside of other main content to ensure it floats */}
      <MessagingDashboard />
    </div>
  );
}
