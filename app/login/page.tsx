"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { Spinner, Button, Modal } from "../components/reusable";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard"); // Redirect if logged in
      } else {
        setAuthLoading(false); // Stop loading if no user found
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!email || !password) {
      setMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await setAuthCookie(userCredential);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      console.error(error);
      setMessage("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await setAuthCookie(userCredential);
      setMessage("Google Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      console.error(error);
      setMessage("Google Sign-In failed. Try again.");
      setLoading(false);
    }
  };

  const setAuthCookie = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    if (!user) return;

    const token = await user.getIdToken(true);
    const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
    const maxAge = 100000;

    if (isLocalhost) {
      document.cookie = `token=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax;`;
    } else {
      document.cookie = `token=${token}; Path=/; Max-Age=${maxAge}; Secure; SameSite=None;`;
    }
  };

  // Show a spinner while checking authentication state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-white to-blue-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-white to-blue-50 px-4">
      {message && <Modal message={message} onClose={() => setMessage(null)} />}

      <div className="w-full max-w-md p-8 bg-white bg-opacity-75 backdrop-blur-md shadow-xl rounded-lg border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">Sign in</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Welcome back! Please enter your details.</p>

        {loading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
            <Button
              variant="default"
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!email || !password}
            >
              Sign In
            </Button>
          </form>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        <Button
          variant="default"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-md shadow-sm hover:bg-gray-100 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M24 9.5c3.18 0 6.04 1.17 8.3 3.09l6.25-6.25C34.86 2.23 29.71 0 24 0 14.64 0 6.44 5.61 2.46 13.76l7.23 5.6C12.33 13.5 17.78 9.5 24 9.5z" />
            <path fill="#34A853" d="M46.67 24.4c0-1.53-.14-3.02-.4-4.46H24v8.91h12.82c-.61 3.1-2.53 5.74-5.23 7.49l7.91 6.14c4.63-4.27 7.17-10.57 7.17-17.08z" />
            <path fill="#FBBC05" d="M10.5 28.15c-1.07-3.17-1.07-6.52 0-9.69L3.27 13.76C-.64 20.47-.64 27.53 3.27 34.24l7.23-6.09z" />
            <path fill="#EA4335" d="M24 48c6.44 0 11.87-2.13 15.86-5.8l-7.91-6.14c-2.17 1.46-4.84 2.27-7.95 2.27-6.22 0-11.67-4-13.89-9.85l-7.23 6.09C6.44 42.39 14.64 48 24 48z" />
          </svg>
          <span className="text-gray-700">Sign in with Google</span>
        </Button>

        <p className="text-center text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
