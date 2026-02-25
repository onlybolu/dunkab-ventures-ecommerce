"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      const user = { id: data.id, _id: data.id, name: data.name, email: data.email };
      sessionStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: { type: "login", user } }));
      router.refresh();
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold text-slate-900">Login to your account</h2>
      <p className="text-sm text-slate-600">Continue your shopping journey securely.</p>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-10 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-slate-900 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-right text-sm text-slate-600">
        <Link href="/forgot-password" className="hover:text-sky-700">Forgot Password?</Link>
      </p>
    </form>
  );
}
