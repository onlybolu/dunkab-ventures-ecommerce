"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Img1 from "../../../public/img1.png";

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rootRef = useRef(null);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setProducts([]);
        setError(data.message || "Failed to fetch products.");
        return;
      }

      setProducts(Array.isArray(data.products) ? data.products : []);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from("[data-hero-copy] > *", {
        opacity: 0,
        y: 32,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from("[data-hero-visual]", {
        opacity: 0,
        x: 45,
        duration: 1,
        ease: "power3.out",
      });

      gsap.to("[data-float='a']", {
        y: -14,
        x: 10,
        repeat: -1,
        yoyo: true,
        duration: 3.6,
        ease: "sine.inOut",
      });

      gsap.to("[data-float='b']", {
        y: 12,
        x: -12,
        repeat: -1,
        yoyo: true,
        duration: 4.5,
        ease: "sine.inOut",
      });

      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.from("[data-product-tile]", {
        opacity: 0,
        y: 46,
        scale: 0.96,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-products-grid]",
          start: "top 84%",
        },
      });

      gsap.from("[data-collection-card]", {
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-collections]",
          start: "top 84%",
        },
      });
    }, rootRef);

    const tiltItems = rootRef.current?.querySelectorAll("[data-tilt]") || [];
    const cleanups = [];

    tiltItems.forEach((item) => {
      const inner = item.querySelector("[data-tilt-inner]") || item;

      const onMove = (event) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 12;
        const rotateX = ((0.5 - y / rect.height)) * 12;

        gsap.to(inner, {
          rotateX,
          rotateY,
          z: 18,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1100,
        });
      };

      const onLeave = () => {
        gsap.to(inner, {
          rotateX: 0,
          rotateY: 0,
          z: 0,
          duration: 0.35,
          ease: "power3.out",
        });
      };

      item.addEventListener("mousemove", onMove);
      item.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        item.removeEventListener("mousemove", onMove);
        item.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [products.length]);

  const handleProductView = (id) => {
    router.push(`/product/${id}`);
  };

  const formatPrice = (value) => {
    const parsed =
      typeof value === "number"
        ? value
        : parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed.toLocaleString() : "0";
  };

  const collections = [
    {
      title: "Expedition Coolers",
      desc: "Long-ice retention, rugged edges, and travel-proof durability.",
      image: "/img1.png",
    },
    {
      title: "Home Entertaining",
      desc: "Elevate your hosting with elegant kitchen and serving essentials.",
      image: "/ads1.png",
    },
    {
      title: "Daily Utility Picks",
      desc: "Reliable essentials designed for daily use and easy maintenance.",
      image: "/img3.png",
    },
  ];

  const badges = ["Fast Delivery", "Secure Checkout", "Trusted Quality", "Lagos Pickup"];

  return (
    <main ref={rootRef} className="overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-100">
      <section className="relative">
        <div data-float="a" className="absolute -left-14 top-10 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
        <div data-float="b" className="absolute -right-10 top-28 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-20">
          <div data-hero-copy className="z-10">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-200">
              Dunkab Cooler Channel
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              A Modern Commerce Experience Built Around Premium Coolers
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
              Shop durable coolers, kitchen essentials, and lifestyle picks in a storefront designed for confidence, speed, and premium product discovery.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-900 hover:bg-sky-400">
                Explore Products
              </Link>
              <Link href="/contact" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-white/10">
                Speak to Sales
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {badges.map((badge) => (
                <div key={badge} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.07em] text-slate-200">
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div data-hero-visual className="z-10" data-tilt>
            <div data-tilt-inner className="tilt-inner rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-cyan-50 p-4">
                <Image
                  src={Img1}
                  alt="Premium cooler"
                  width={900}
                  height={520}
                  priority
                  className="mx-auto w-full max-w-[520px] drop-shadow-[0_24px_40px_rgba(15,23,42,0.35)]"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-900 px-3 py-3 text-center text-white">
                  <p className="text-2xl font-bold">10k+</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">Orders</p>
                </div>
                <div className="rounded-xl bg-slate-900 px-3 py-3 text-center text-white">
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">Satisfaction</p>
                </div>
                <div className="rounded-xl bg-slate-900 px-3 py-3 text-center text-white">
                  <p className="text-2xl font-bold">24h</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">Dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3" data-collections>
            {collections.map((item) => (
              <article
                key={item.title}
                data-collection-card
                data-tilt
                className="tilt-shell overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
              >
                <div data-tilt-inner className="tilt-inner">
                  <img src={item.image} alt={item.title} className="h-52 w-full object-cover" />
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                    <Link href="/products" className="mt-4 inline-block text-sm font-semibold uppercase tracking-[0.07em] text-sky-700 hover:text-sky-900">
                      Shop Collection
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal className="bg-gradient-to-b from-slate-100 to-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Featured Products</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Top Picks In The Channel</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">Curated high-demand items combining storage performance, utility, and modern design.</p>
            </div>
            <Link href="/products" className="hidden rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-sky-700 sm:inline-block">
              View All Products
            </Link>
          </div>

          {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {loading ? (
            <div className="flex h-56 items-center justify-center">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">No products found.</div>
          ) : (
            <div data-products-grid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <article
                  key={product._id}
                  data-product-tile
                  data-tilt
                  className="tilt-shell cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.15)]"
                  onClick={() => handleProductView(product._id)}
                >
                  <div data-tilt-inner className="tilt-inner">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={400}
                      height={240}
                      className="h-52 w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-sky-700">Channel Select</p>
                      <h3 className="whitespace-nowrap overflow-hidden text-ellipsis text-lg font-semibold text-slate-900">{product.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">Premium quality • Fast delivery</p>
                      <p className="mt-3 text-xl font-bold text-slate-900">₦{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="inline-block rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-sky-700">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section data-reveal className="bg-slate-900 py-14 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Why Dunkab</p>
            <h2 className="mt-2 text-3xl font-bold">Commerce Built For Product Confidence</h2>
            <p className="mt-4 max-w-xl text-slate-300">
              From product selection to checkout, every section is tuned for trust, speed, and clearer buying decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">Reliable Inventory</h3>
              <p className="mt-1 text-sm text-slate-300">Stocked products with transparent pricing and quick updates.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="mt-1 text-sm text-slate-300">Trusted payment workflow and order verification flow.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">Fast Support</h3>
              <p className="mt-1 text-sm text-slate-300">Dedicated contact channel for pre and post purchase help.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">Pickup + Delivery</h3>
              <p className="mt-1 text-sm text-slate-300">Flexible order fulfillment to fit customer needs.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
