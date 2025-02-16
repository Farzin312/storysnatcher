"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./reusable";

const MobileNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close the sidebar if clicking outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="md:hidden">
      {/* Mobile Navbar Header */}
      <nav className="flex items-center justify-between px-4 border-b shadow-sm bg-white">
        <button onClick={() => setIsSidebarOpen(true)} className="focus:outline-none">
          <Menu size={24} />
        </button>
        <div>
          <Logo />
        </div>
        <Button variant="default">
          <Link href="/auth">Login</Link>
        </Button>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
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
                className="block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Generate
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsServicesExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
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
                      href="/services/summary"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      Summary
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/transcribe"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      Transcribe
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/video"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      Video
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/voice"
                      onClick={() => setIsSidebarOpen(false)}
                      className="block text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      Voice
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link
                href="/pricing"
                onClick={() => setIsSidebarOpen(false)}
                className="block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                onClick={() => setIsSidebarOpen(false)}
                className="block text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
