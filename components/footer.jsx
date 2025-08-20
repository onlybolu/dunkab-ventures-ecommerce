import Logo from "./Logo";

const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Logo width={"w-12"} height={"h-12"} fontSize={"text-xl"} className="pb-2"/>
            <p className="text-sm text-gray-400">
              Your trusted source for quality products. Fast delivery, secure payment, and unbeatable service.
            </p>
          </div>
  
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/shop" className="hover:text-white">Shop</a></li>
              <li><a href="/cart" className="hover:text-white">Cart</a></li>
              <li><a href="/wishlist" className="hover:text-white">Wishlist</a></li>
            </ul>
          </div>
  
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              <li><a href="/returns" className="hover:text-white">Returns</a></li>
              <li><a href="/privacy-policy" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
  
          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <div className="flex  space-x-4 text-gray-400">
            <p className="flex items-center text-sm gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-telephone-fill"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"
              />
            </svg>

            <a
              href="tel:+2348037466334"
              className="underline-0 hover:underline"
            >
              08037466334 {","}
            </a>
            <a
              href="tel:+2348028414639"
              className="underline-0 hover:underline"
            >
              08028414639
            </a>
          </p>            
              <a href="#" className="hover:text-white">
                <i className="fab fa-twitter" />
              </a>
              <a href="#" className="hover:text-white">
                <i className="fab fa-instagram" />
              </a>
              <a href="#" className="hover:text-white">
                <i className="fab fa-linkedin" />
              </a>
            </div>
          </div>
        </div>
  
        <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Dunkab Ventures. All rights reserved.
        </div>
      </footer>
    );
  };
  
  export default Footer;
  