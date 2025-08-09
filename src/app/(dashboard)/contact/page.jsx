"use client";

import { useState } from "react";
import Logo from "../../../../components/Logo";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [mobileTab, setMobileTab] = useState("form");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const res = await fetch("/api/contact", {
    //   method: "POST",
    //   body: JSON.stringify(formData),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (res.ok) {
    //   setStatus(" Message sent successfully!");
    //   setFormData({ name: "", email: "", subject: "", message: "" });
    // } else {
    //   setStatus(" Failed to send message. Please try again.");
    // }
  };

  const ContactForm = (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-md"
    >
      <input
        type="text"
        name="name"
        required
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name"
        className="w-full border p-2 rounded"
      />
      <input
        type="email"
        name="email"
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="Your Email"
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="subject"
        required
        value={formData.subject}
        onChange={handleChange}
        placeholder="Subject"
        className="w-full border p-2 rounded"
      />
      <textarea
        name="message"
        required
        rows={5}
        value={formData.message}
        onChange={handleChange}
        placeholder="Your Message"
        className="w-full border p-2 rounded"
      ></textarea>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send Message
      </button>
      {status && (
        <p className="text-sm text-green-600 mt-2 font-medium">{status}</p>
      )}
    </form>
  );

  const AddressSection = (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-xl font-bold mb-2 text-blue-700">Dunkab Ventures</h3>
      <p>Block 'N' shop 57 & 58 also known as pepsi building orodomu, Ebute ero market, lagos island.</p>
      <p>
        📞{" "}
        <a href="tel:+2348037466334" className="text-blue-600 hover:underline">
          +234 8037 466 334
        </a>
      </p>
      <p>
        📧{" "}
        <a
          href="mailto:info@dunkabventures.com"
          className="text-blue-600 hover:underline"
        >
          info@dunkabventures.com
        </a>
      </p>
      <p>🕐 Monday – Friday: 8:00AM – 6:00PM</p>
      <div className="mt-4">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18..." // Update this
          width="100%"
          height="200"
          className="rounded"
          allowFullScreen=""
          loading="lazy"
          title="Dunkab Ventures Location"
        ></iframe>
      </div>
    </div>
  );

  return (
    <div className="">
      <div className="w-full relative">
              <Image
                src={"/productbg.png"}
                alt="Products"
                width={500}
                height={500}
                className="w-full h-100"
              />
              <div className="absolute top-0 left-0 w-full h-100 flex flex-col items-center justify-center bg-white/30 bg-opacity-50 text-white text-2xl font-bold">
                <div className=" flex items-center">
                  <Logo
                    width={"w-15"}
                    height={"h-20"}
                    hidden={"hidden"}
                    fontSize={"text-2xl"}
                  />
                  <p className="hover:underline text-3xl font-semibold text-gray-700">Contact Us</p>
                </div>
                <div className="text-gray-600 flex gap-2">
                  <p className="font-medium">Home</p>
                  <p className="font-bold text-black">{">"}</p>
                  <p className="font-medium">Contact</p>
                </div>
              </div>
            </div>
     <div className=" bg-white py-12 px-4 sm:px-6 lg:px-16 ">
     <div className="flex flex-col justify-center items-center gap-1 md:pb-4 pb-8">
     <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Contact Us
      </h2>
      <hr className="w-20 border-2 border-gray-900" />
     </div>

      {/* Mobile Only */}
      <div className="lg:hidden">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMobileTab("form")}
            className={`px-4 py-2 rounded-md font-medium ${
              mobileTab === "form" ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Contact Form
          </button>
          <button
            onClick={() => setMobileTab("address")}
            className={`px-4 py-2 rounded-md font-medium ${
              mobileTab === "address" ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Our Address
          </button>
        </div>

        {mobileTab === "form" ? ContactForm : AddressSection}
      </div>

      {/* Desktop Only */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-10">
        {ContactForm}
        {AddressSection}
      </div>
     </div>
    </div>
  );
}
