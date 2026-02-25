"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function Auth() {
  const searchParams = useSearchParams();
  const initialTab = useMemo(() => {
    const signup = searchParams.get("signup");
    return signup === "true" ? "signup" : "login";
  }, [searchParams]);

  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-cyan-50/30 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1fr]">
          <aside className="bg-slate-900 p-8 text-white lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">Dunkab Commerce</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">Welcome Back To Better Shopping</h1>
            <p className="mt-4 text-sm text-slate-300">
              Sign in to track orders, manage wishlist, and checkout faster. New here? Create your account in under a minute.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.08em]">
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">Secure Account</div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">Fast Checkout</div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">Track Orders</div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">Saved Wishlist</div>
            </div>
          </aside>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
              <button
                onClick={() => setTab("login")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${tab === "login" ? "bg-slate-900 text-white" : "text-slate-700"}`}
              >
                Login
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${tab === "signup" ? "bg-slate-900 text-white" : "text-slate-700"}`}
              >
                Sign Up
              </button>
            </div>

            {tab === "login" ? <LoginForm /> : <SignupForm />}

            <p className="mt-6 text-sm text-slate-500">
              Prefer to browse first?{" "}
              <Link href="/" className="font-semibold text-sky-700 hover:text-sky-900">
                Continue as guest
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
