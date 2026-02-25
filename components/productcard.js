"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
  const router = useRouter();
  const formatPrice = (value) => {
    const parsed =
      typeof value === "number"
        ? value
        : parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed.toLocaleString() : "0";
  };

  const handleProductClick = () => {
    if (!product?._id) return;
    router.push(`/product/${product._id}`);
  };

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.16)] cursor-pointer"
      onClick={handleProductClick}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.title}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-sky-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          Cooler Pick
        </div>
      </div>

      <div className="flex h-[170px] flex-col p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{product.title}</h3>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">Insulated Performance</p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-xl font-bold text-slate-900">₦{formatPrice(product.price)}</p>
          <Link
            href={`/product/${product._id}`}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-sky-700"
            onClick={(e) => e.stopPropagation()}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
