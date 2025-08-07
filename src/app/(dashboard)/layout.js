"use client"
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import Middow from "../../../components/middow";
import { FavoriteProvider } from "../../../context/FavoriteContext";



export default function RootLayout({ children }) {
  return (
    <div>
      <div className="">
        <Middow />
        <div className="sticky top-0 z-100">
            <Header />
        </div>
        <FavoriteProvider>

        {children}
        </FavoriteProvider>
        <div className="flex flex-col h-full justify-end">
        <Footer />
        </div>
      </div>
    </div>
  );
}
