"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // <-- Add this line
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json(); // <-- this was missing too

      if (!res.ok) {
        setError(data?.message);
        toast.error(data?.message || "Signup failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/productcart");
    } catch (err) {
        toast.error("Something went wrong. Please try again.");
      setError(err.message); // use setError here too
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
        <ToastContainer />
      {error && (
        <p className="text-red-500 text-sm bg-red-100 px-3 py-2 rounded">
          {error}
        </p>
      )}

      <input
        type="text"
        placeholder="Full-name"
        className="w-full border px-4 py-2 focus:outline-none focus:ring focus:border-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full border px-4 py-2 focus:outline-none focus:ring focus:border-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border px-4 py-2 focus:outline-none focus:ring focus:border-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-black text-white py-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Signup"}
      </button>
    </form>
  );
}
