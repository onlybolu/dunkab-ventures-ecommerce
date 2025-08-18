import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../../context/cartContext";
import { FavoriteProvider } from "../../context/FavoriteContext";

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
  alternates: {
    canonical: 'https://dunkabventures.com',
  },
};

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dunkab Ventures",
  "url": "https://dunkabventures.com",
  "logo": "https://dunkabventures.com/logo.png",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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