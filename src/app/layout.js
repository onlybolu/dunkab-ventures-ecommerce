import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../../context/cartContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dunkab Ventures",
  description: "At Dunkab, we specialized in providing high quality America coolers, Stylish bags, Unique Souvenirs & Kitchen sets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      
      <CartProvider>
      {children}
      </CartProvider>
       
       
      </body>
    </html>
  );
}
