"use client";

import { useState } from "react";
import Logo from "../../../../components/Logo"; // Adjust path as needed
import { toast, ToastContainer } from "react-toastify";
// Assuming react-toastify CSS is imported globally in your project.

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileTab, setMobileTab] = useState("form"); // 'form' or 'address'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.info("Sending message...");

    try {
      // Uncomment and implement your actual API call when ready
      // const res = await fetch("/api/contact", {
      //   method: "POST",
      //   body: JSON.stringify(formData),
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isSuccess = Math.random() > 0.5; // Simulate success/failure

      if (isSuccess) { // Replace with res.ok
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContactForm = (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="sr-only">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">Your Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="subject" className="sr-only">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="message" className="sr-only">Your Message</label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 resize-y"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );

  const AddressSection = (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Our Information</h2>
        <div className="space-y-5 text-gray-700">
          <div className="flex items-start space-x-3">
            {/* MapPin icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-indigo-600 mt-1"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <p className="text-base">
              Block 'N' shop 57 & 58, also known as Pepsi Building, Orodumu, Ebute Ero Market, Lagos Island, Nigeria.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Phone icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-indigo-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2.008 15.79 15.79 0 0 1-8.82-5.592 15.79 15.79 0 0 1-5.592-8.82A2 2 0 0 1 4.08 2H7l2.18 2.18a2 2 0 0 1 .41 2.44L8.38 9.92a14.523 14.523 0 0 0 6.64 6.64l1.44-1.44a2 2 0 0 1 2.44.41L22 16.92z"/></svg>
            <a href="tel:+2348037466334" className="text-blue-600 hover:underline text-base">
              +234 8037 466 334
            </a>
          </div>
          <div className="flex items-center space-x-3">
            {/* Mail icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-indigo-600"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <a href="mailto:info@dunkabventures.com" className="text-blue-600 hover:underline text-base">
              info@dunkabventures.com
            </a>
          </div>
          <div className="flex items-center space-x-3">
            {/* Clock icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-indigo-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p className="text-base">Monday – Friday: 8:00 AM – 6:00 PM</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Find Us on Map</h3>
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.636618791002!2d3.393844874987742!3d6.43888399355776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b17b2f4f22f%3A0x7d2b2c9e7e7e7e7e!2sEbute%20Ero%20Market!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" // Placeholder for your actual map embed code
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Dunkab Ventures Location"
          ></iframe>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} newestOnTop={true} />

      {/* Hero Section - Animated Gradient Background */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600">
        {/* Animated Circles/Bubbles Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ul className="circles">
            <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
          </ul>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-4 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-lg">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 drop-shadow">
            We'd love to hear from you!
          </p>
          <div className="flex items-center mt-4 text-sm md:text-base font-medium animate-fade-in delay-300">
            <a href="/" className="hover:underline opacity-90">Home</a>
            <span className="mx-2 opacity-70">/</span>
            <span className="font-semibold">Contact Us</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12 animate-fade-in delay-500">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Reach Out to Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you have a question about our products, need support, or just want to say hello, our team is ready to help.
          </p>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-8 animate-fade-in delay-700">
          <div className="flex justify-center bg-gray-200 rounded-full p-1 shadow-inner">
            <button
              onClick={() => setMobileTab("form")}
              className={`flex-1 px-5 py-2 rounded-full text-base font-medium transition-all duration-300 ${
                mobileTab === "form" ? "bg-indigo-600 text-white shadow-md" : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Contact Form
            </button>
            <button
              onClick={() => setMobileTab("address")}
              className={`flex-1 px-5 py-2 rounded-full text-base font-medium transition-all duration-300 ${
                mobileTab === "address" ? "bg-indigo-600 text-white shadow-md" : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Our Address
            </button>
          </div>
        </div>

        {/* Content Sections (Mobile & Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          <div className={`${mobileTab === "form" ? "block" : "hidden lg:block"}`}>
            {ContactForm}
          </div>
          <div className={`${mobileTab === "address" ? "block" : "hidden lg:block"}`}>
            {AddressSection}
          </div>
        </div>
      </div>

      {/* Custom CSS for the animated circles */}
    
    </div>
  );
}
