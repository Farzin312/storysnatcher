"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./reusable";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";

const MobileNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="md:hidden">
      {/* Mobile Navbar Header */}
      <nav
        className="flex items-center justify-between px-4 border-b shadow-sm"
        aria-label="Mobile Navigation"
      >
        <button onClick={() => setIsSidebarOpen(true)} className="focus:outline-none">
          <Menu size={24} />
        </button>
        <div>
          <Logo />
        </div>
        {user ? (
          <Button variant="default" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button variant="default">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-white to-blue-100 shadow-xl rounded-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between font-bold px-4 py-3 border-b">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setIsSidebarOpen(false)} className="focus:outline-none">
            <X size={24} />
          </button>
        </div>
        <div className="px-4 py-6">
          <ul className="space-y-4">
            <li>
              <Link
                href="/generate"
                onClick={() => setIsSidebarOpen(false)}
                className="block text-lg font-medium text-gray-700 hover:text-blue-600 font-bold transition-colors"
              >
                Generate
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsServicesExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between text-lg font-medium text-gray-700 hover:text-blue-600 font-bold transition-colors focus:outline-none"
              >
                <span>Services</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isServicesExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isServicesExpanded && (
                <ul className="mt-2 space-y-2 pl-4 border-l border-gray-200">
                  <li>
                    <Link
                      href="/services/transcribe"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Transcription
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/summary"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Summary
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/video"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Flashcard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/voice"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Quiz
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <button
                onClick={() => setIsDashboardExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between text-lg font-medium text-gray-700 hover:text-blue-600 font-bold transition-colors focus:outline-none"
              >
                <span>Dashboard</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isDashboardExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isDashboardExpanded && (
                <ul className="mt-2 space-y-2 pl-4 border-l border-gray-200">
                  <li>
                    <Link
                      href="/dashboard/generate"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Generate
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/transcriptions"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Transcriptions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/summaries"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Summaries
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/flashcards"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Flashcards
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/quizzes"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 font-bold transition-colors"
                    >
                      Quizzes
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link
                href="/pricing"
                onClick={() => setIsSidebarOpen(false)}
                className="block text-lg font-medium text-gray-700 hover:text-blue-600 font-bold transition-colors"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
