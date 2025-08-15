import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../../context/cartContext";
import { FavoriteProvider } from "../../context/FavoriteContext"

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
  description:
    "At Dunkab, we specialize in providing high quality America coolers, stylish bags, unique souvenirs & kitchen sets",
};

export default function RootLayout({ children }) {
  const logoSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "url": "https://dunkabventures.com",
    "logo": "https://dunkabventures.com/logo.png" // make sure this URL is correct & accessible
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(logoSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
        <FavoriteProvider>
          {children}
          </FavoriteProvider>
          </CartProvider>
      </body>
    </html>
  );
}
