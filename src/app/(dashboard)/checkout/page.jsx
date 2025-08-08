// /checkout/page.js or similar
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      router.push("/auth");
    }
  }, []);

  return (
    <div>
      {/* Checkout content goes here */}
    </div>
  );
}
