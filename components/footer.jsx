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
            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-white">
                <i className="fab fa-facebook-f" />
              </a>
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
  