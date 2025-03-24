"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { auth } from "../../../firebase";
import { Button } from "./Button";

interface LoginComponentProps {
  children: React.ReactNode;
  onLoginClick?: () => void;
}

export default function LoginComponent({ children, onLoginClick }: LoginComponentProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="p-6 bg-white bg-opacity-75 backdrop-blur-md shadow-xl rounded-lg border border-gray-200 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Restricted Content</h3>
      <p className="text-gray-600 mb-4">
        You need to be logged in to view this content.
      </p>
      {onLoginClick ? (
        <Button
          variant="default"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
          onClick={onLoginClick}
        >
          Login
        </Button>
      ) : (
        <Button
          variant="default"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          <Link href="/login">Login</Link>
        </Button>
      )}
    </div>
  );
}
