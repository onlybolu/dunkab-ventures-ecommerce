import Link from "next/link";

const Ads = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-gray-100 to-slate-200 p-4 sm:p-6 lg:p-8">
      <div data-tilt className="max-w-5xl mx-auto rounded-3xl overflow-hidden md:flex border border-white/60 shadow-[0_24px_70px_rgba(30,41,59,0.2)] bg-white/70 backdrop-blur-sm">
        <div className="md:w-1/2">
          <img
            src="/ads1.png"
            alt="Modern Kitchen Set"
            className="w-full h-64 md:h-full object-cover"
            onError={(e) => {
              e.target.src = "https://placehold.co/800x600/D3D3D3/000000?text=Image+Not+Found";
            }}
          />
        </div>

        <div data-tilt-inner className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center text-center md:text-left gap-4">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-700">Featured Promotion</p>
          <h2 className="text-gray-900 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Cooking Made Easier <br className="hidden sm:inline" /> with <span className="text-blue-600">Dunkab</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Discover reliable kitchen essentials that blend performance, durability, and modern design.
          </p>

          <Link
            href="/products"
            className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-lg shadow-lg md:self-start self-center"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Ads;
