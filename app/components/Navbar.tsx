"use client";

import React, { useState, useRef, useEffect } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "./reusable";

const Navbar = () => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLLIElement>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setIsServicesOpen(false);
    }, 300);
  };

  return (
    <nav className="hidden md:flex items-center justify-between px-6 border-b shadow-sm bg-white">
        <Logo />
      <ul className="flex items-center gap-6 text-sm font-medium">
        <li>
          <Link href="/generate" className="hover:text-blue-600 transition duration-300">
            Generate
          </Link>
        </li>
        <li
          ref={desktopDropdownRef}
          className="relative cursor-pointer flex items-center gap-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="hover:text-blue-600 transition duration-300 flex items-center">
            Services <ChevronDown size={16} />
          </span>
          {isServicesOpen && (
            <div
              className="absolute left-0 top-full mt-1 w-48 bg-white shadow-lg border border-gray-200 rounded-lg p-2 z-50"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/services/summary"
                className="block px-4 py-2 hover:bg-blue-200 rounded-md transition duration-300"
              >
                Summary
              </Link>
              <Link
                href="/services/transcribe"
                className="block px-4 py-2 hover:bg-blue-200 rounded-md transition duration-300"
              >
                Transcribe
              </Link>
              <Link
                href="/services/video"
                className="block px-4 py-2 hover:bg-blue-200 rounded-md transition duration-300"
              >
                Video
              </Link>
              <Link
                href="/services/voice"
                className="block px-4 py-2 hover:bg-blue-200 rounded-md transition duration-300"
              >
                Voice
              </Link>
            </div>
          )}
        </li>
        <li>
          <Link href="/pricing" className="hover:text-blue-600 transition duration-300">
            Pricing
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="hover:text-blue-600 transition duration-300">
            Dashboard
          </Link>
        </li>
      </ul>

      {/* Right: Login Button */}
      <div>
        <Button variant="default">
          <Link href="/auth" className="text-sm font-medium">
            Login
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
