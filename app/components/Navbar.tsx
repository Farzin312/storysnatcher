"use client";

import React, { useState, useRef, useEffect } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "./reusable";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const desktopServicesRef = useRef<HTMLLIElement>(null);
  const desktopDashboardRef = useRef<HTMLLIElement>(null);
  const servicesDropdownTimeoutRef = useRef<number | null>(null);
  const dashboardDropdownTimeoutRef = useRef<number | null>(null);
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

  // --- Services Dropdown Handlers (50ms delay on leave) ---
  const handleServicesMouseEnter = () => {
    if (servicesDropdownTimeoutRef.current) {
      clearTimeout(servicesDropdownTimeoutRef.current);
      servicesDropdownTimeoutRef.current = null;
    }
    setIsServicesOpen(true);
  };

  const handleServicesMouseLeave = () => {
    servicesDropdownTimeoutRef.current = window.setTimeout(() => {
      setIsServicesOpen(false);
    }, 50);
  };

  // --- Dashboard Dropdown Handlers (50ms delay on leave) ---
  const handleDashboardMouseEnter = () => {
    if (dashboardDropdownTimeoutRef.current) {
      clearTimeout(dashboardDropdownTimeoutRef.current);
      dashboardDropdownTimeoutRef.current = null;
    }
    setIsDashboardOpen(true);
  };

  const handleDashboardMouseLeave = () => {
    dashboardDropdownTimeoutRef.current = window.setTimeout(() => {
      setIsDashboardOpen(false);
    }, 50);
  };

  // --- Close dropdowns if clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopServicesRef.current &&
        !desktopServicesRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false);
      }
      if (
        desktopDashboardRef.current &&
        !desktopDashboardRef.current.contains(event.target as Node)
      ) {
        setIsDashboardOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className="relative hidden md:flex items-center justify-between px-6 border-b shadow-sm bg-white"
      aria-label="Main Navigation"
    >
      <Logo />
      <ul className="flex items-center gap-6 text-sm font-medium">
        <li>
          <Link
            href="/generate"
            className="hover:text-blue-600 font-bold transition duration-300"
          >
            Generate
          </Link>
        </li>
        {/* Services Dropdown Trigger */}
        <li
          ref={desktopServicesRef}
          className="relative cursor-pointer flex items-center gap-1"
          onMouseEnter={handleServicesMouseEnter}
          onMouseLeave={handleServicesMouseLeave}
        >
          <span className="hover:text-blue-600 font-bold transition duration-300 flex items-center">
            Services <ChevronDown size={16} />
          </span>
          {isServicesOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-36 bg-white shadow-lg border border-gray-200 rounded-lg p-2 z-50"
              onMouseEnter={handleServicesMouseEnter}
              onMouseLeave={handleServicesMouseLeave}
            >
              <Link
                href="/services/transcribe"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Transcription
              </Link>
              <Link
                href="/services/summary"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Summary
              </Link>
              <Link
                href="/services/flashcards"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Flashcard
              </Link>
              <Link
                href="/services/quizzes"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Quiz
              </Link>
            </div>
          )}
        </li>
        {/* Dashboard Dropdown Trigger */}
        <li
          ref={desktopDashboardRef}
          className="relative cursor-pointer flex items-center gap-1"
          onMouseEnter={handleDashboardMouseEnter}
          onMouseLeave={handleDashboardMouseLeave}
        >
          <span className="hover:text-blue-600 font-bold transition duration-300 flex items-center">
            Dashboard <ChevronDown size={16} />
          </span>
          {isDashboardOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-55 bg-white shadow-lg border border-gray-200 rounded-lg p-2 z-50"
              onMouseEnter={handleDashboardMouseEnter}
              onMouseLeave={handleDashboardMouseLeave}
            >
              <Link
                href="/dashboard/quickgenerate"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Quick Generate
              </Link>
              <Link
                href="/dashboard/transcriptions"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Transcriptions
              </Link>
              <Link
                href="/dashboard/summaries"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Summaries
              </Link>
              <Link
                href="/dashboard/flashcards"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Flashcards
              </Link>
              <Link
                href="/dashboard/quizzes"
                className="block px-4 py-2 hover:bg-blue-200 font-bold rounded-md transition duration-300"
              >
                Quizzes
              </Link>
            </div>
          )}
        </li>
        <li>
          <Link
            href="/pricing"
            className="hover:text-blue-600 font-bold transition duration-300"
          >
            Pricing
          </Link>
        </li>
      </ul>

      <div>
        {user ? (
          <Button
            variant="default"
            onClick={handleLogout}
            className="text-sm font-medium"
          >
            Logout
          </Button>
        ) : (
          <Button variant="default">
            <Link href="/login" className="text-sm font-medium">
              Login
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
