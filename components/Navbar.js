'use client';

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react"; // Import useRef
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Navbar() {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null); // State to hold user data
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // State for dropdown visibility

  const router = useRouter(); // Initialize useRouter
  const dropdownRef = useRef(null); // Ref for the dropdown container

  useEffect(() => {
    setIsMounted(true);

    // Initialize theme
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }

    // Check for logged-in user on mount
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        localStorage.removeItem("currentUser"); // Clear invalid data
      }
    }

    // Event listener for changes in localStorage (e.g., logout from another tab)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("currentUser");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);

    // Event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); // Clear user data from localStorage
    setUser(null); // Clear user state in Navbar
    setShowProfileDropdown(false); // Close dropdown
    router.push('/login'); // Redirect to login page
  };

  if (!isMounted) return null; // Prevent mismatched theme/user state flash on load

  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[80%] h-[60px] z-50 flex items-center justify-between px-6 rounded-full border backdrop-blur-md text-black dark:text-white border-gray-200 dark:border-gray-700 shadow-xl bg-white/30 dark:bg-black/30"
    >
      {/* Left Side Links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold hover:text-yellow-400 transition">
          Home
        </Link>
        <Link href="/rider" className="hover:text-yellow-400 transition">
          Ride
        </Link>
        <Link href="/driver" className="hover:text-yellow-400 transition">
          Drive
        </Link>
      </div>

      {/* Right Side: Theme toggle + Auth links / Profile */}
      <div className="flex items-center gap-6 relative"> {/* Added relative for dropdown positioning */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {user ? (
          // User is logged in: Show profile image and dropdown
          <div className="relative" ref={dropdownRef}> {/* Attach ref here */}
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none"
            >
              {/* Profile Image - User needs to place 'profile.png' in public folder */}
              <img
                src="/profile1.png" // Placeholder image path
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/ffffff?text=U'; }} // Fallback if image not found
              />
              {/* Optional: Display user's first name if available, otherwise last 4 digits of phone */}
              <span className="hidden sm:inline text-sm">
                {user.firstName || user.phone.slice(-4)}
              </span>
              {/* Dropdown arrow icon */}
              <svg className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowProfileDropdown(false)} // Close dropdown on click
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // User is not logged in: Show Login and Signup buttons
          <>
            <Link href="/login" className="hover:text-yellow-400 transition">
              Login
            </Link>

            <div className="px-4 py-2 rounded-3xl bg-black text-white hover:bg-yellow-400 hover:text-black dark:bg-white dark:text-black dark:hover:bg-yellow-400 dark:hover:text-white transition">
              <Link href="/signup" className="z-10 transition text-inherit">
                Signup
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
