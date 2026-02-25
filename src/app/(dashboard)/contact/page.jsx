"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      toast.success("Message sent. Our team will respond shortly.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Unable to send message right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <ToastContainer position="top-center" autoClose={3000} newestOnTop />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="font-semibold text-white">Contact</span>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Customer Care</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Talk To Our Cooler Specialists</h1>
        <p className="mt-4 max-w-2xl text-slate-300">Need help choosing the right cooler, order support, or wholesale enquiries? Reach out and our team will guide you.</p>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
          <h2 className="mb-5 text-2xl font-bold">Send a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />
            <textarea
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
          <h2 className="mb-5 text-2xl font-bold">Visit or Call Us</h2>

          <div className="space-y-5 text-slate-200">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-sky-300">Address</p>
              <p className="mt-1">Block N, Shops 57 & 58 (Pepsi Building), Orodumu, Ebute Ero Market, Lagos Island, Nigeria.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-sky-300">Phone</p>
              <div className="mt-1 flex flex-col gap-1">
                <a href="tel:+2348037466334" className="hover:text-white">+234 803 746 6334</a>
                <a href="tel:+2348028414639" className="hover:text-white">+234 802 841 4639</a>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-sky-300">Hours</p>
              <p className="mt-1">Monday - Saturday, 9:00 AM - 6:00 PM</p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.636618791002!2d3.393844874987742!3d6.43888399355776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b17b2f4f22f%3A0x7d2b2c9e7e7e7e7e!2sEbute%20Ero%20Market!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Dunkab Ventures Location"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
