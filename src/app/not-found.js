import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl text-center max-w-lg w-full">
        {/* Large, attention-grabbing 404 text */}
        <h1 className="text-9xl font-extrabold text-indigo-600 mb-4 animate-bounce">
          404
        </h1>
        {/* Main heading for the page */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Page Not Found
        </h2>
        {/* User-friendly message */}
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Don't worry, we'll help you get back on track.
        </p>
        {/* Button to navigate back to the home page */}
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ease-in-out duration-150"
        >
          {/* Home icon */}
          <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
