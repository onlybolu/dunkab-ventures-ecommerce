import React from 'react';
import Aos from "aos";
import { useEffect } from "react";
// Main App component
const Ads = ({}) => {

     useEffect(() => {
        Aos.init({
          delay: 100,
          duration: 700,
          once: false,
        });
      }, []);

  return (
    <div data-aos="" className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Ad Container */}
      <div data-aos="fade-up" className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden md:flex">
        {/* Image Section */}
        <div className="md:w-1/2">
          {/*
            NOTE: Please replace this placeholder image URL with your actual kitchen set image.
            For a less bright aesthetic, choose an image with soft, muted lighting and neutral tones.
            Example: <img src="your-kitchen-set-image.jpg" alt="Beautiful Kitchen Set" />
          */}
          <img
            src="/ads1.png"
            alt="Modern Kitchen Set"
            className="w-full h-64 md:h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
            // Adding an onError fallback for placeholder in case it doesn't load
            onError={(e) => { e.target.src = 'https://placehold.co/800x600/D3D3D3/000000?text=Image+Not+Found'; }}
          />
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center text-center md:text-left">
          {/* Headline */}
          <h2 className="text-gray-800 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Cooking Made Easier <br className="hidden sm:inline" /> with <span className="text-blue-600">Dunkab</span>
          </h2>

          {/* Call to Action Link */}
          <a
            href="/products" 
            className="
              mt-6 inline-block bg-blue-600 hover:bg-blue-700
              text-white font-bold py-3 px-6 rounded-full
              transition duration-300 ease-in-out transform hover:scale-105
              text-lg shadow-lg hover:shadow-xl
              md:self-start self-center
              border-2 border-transparent hover:border-blue-800
            "
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Ads;
