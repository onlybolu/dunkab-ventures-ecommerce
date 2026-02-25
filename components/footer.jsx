import Link from "next/link";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo width={"w-12"} height={"h-12"} fontSize={"text-xl"} className="pb-2" />
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Trusted coolers and home essentials built for durability, style, and dependable delivery across Nigeria.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-white">Shop</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/products" className="hover:text-white">All Products</Link></li>
            <li><Link href="/productcart" className="hover:text-white">Cart</Link></li>
            <li><Link href="/wishlists" className="hover:text-white">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-white">Support</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/orders" className="hover:text-white">Track Orders</Link></li>
            <li><Link href="/checkout" className="hover:text-white">Checkout</Link></li>
            <li><Link href="/authentication" className="hover:text-white">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-white">Reach Us</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>Block N, Shops 57 & 58, Ebute Ero, Lagos Island.</p>
            <p>
              <a href="tel:+2348037466334" className="hover:text-white">08037466334</a>
              {" · "}
              <a href="tel:+2348028414639" className="hover:text-white">08028414639</a>
            </p>
            <p>
              <a href="mailto:info@dunkabventures.com" className="hover:text-white">info@dunkabventures.com</a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Dunkab Ventures. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
