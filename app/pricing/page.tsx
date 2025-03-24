"use client";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

function Pricing() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Force refresh the token
        const idToken = await firebaseUser.getIdToken(true);
        setToken(idToken);
      } else {
        setUser(null);
        setToken("");
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleSubscribe(tier: "gold" | "diamond") {
    if (!token) {
      alert("Please sign in to subscribe.");
      return;
    }
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
      <p className="mb-6">
        Upgrade your account for premium features. Select Gold for $4.99/month or Diamond for $9.99/month.
      </p>
      {user && (
        <p className="mb-4 text-sm">
          Signed in as: <span className="font-semibold">{user.email}</span>
        </p>
      )}
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => handleSubscribe("gold")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Gold - $4.99/month
        </button>
        <button
          onClick={() => handleSubscribe("diamond")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Diamond - $9.99/month
        </button>
      </div>
    </div>
  );
}

export default Pricing;
