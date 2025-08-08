// app/components/Auth.jsx
"use client";
import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full max-w-4xl mx-auto my-10 px-4">
      {/* Toggle for mobile */}
      <div className="md:hidden flex justify-center mb-4">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-4 py-2 ${isLogin ? "font-bold border-b-2 border-black" : ""}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 ${!isLogin ? "font-bold border-b-2 border-black" : ""}`}
        >
          Signup
        </button>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex gap-10 justify-between">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <LoginForm />
        </div>
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-4">Signup</h2>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
