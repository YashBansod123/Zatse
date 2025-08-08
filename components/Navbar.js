'use client';

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { User, Car, Shield, ChevronDown } from 'lucide-react'; // Added icons for roles

export default function Navbar() {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false); // New state for role dropdown

  const router = useRouter();
  const dropdownRef = useRef(null);

  const ROLES = [
    { name: 'Rider', role: 'rider', icon: <User className="w-4 h-4 mr-2" /> },
    { name: 'Driver', role: 'driver', icon: <Car className="w-4 h-4 mr-2" /> },
    { name: 'Admin', role: 'admin', icon: <Shield className="w-4 h-4 mr-2" /> },
  ];

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        localStorage.removeItem("currentUser");
      }
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("currentUser");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
        setShowRoleDropdown(false);
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setShowProfileDropdown(false);
    setShowRoleDropdown(false);
    router.push('/login');
  };

  const switchRole = (newRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setShowRoleDropdown(false);
      
      // Navigate based on the new role
      if (newRole === 'rider') router.push('/');
      if (newRole === 'driver') router.push('/driver/dashboard');
      if (newRole === 'admin') router.push('/admin/dashboard');
    }
  };

  if (!isMounted) return null;

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
      <div className="flex items-center gap-6 relative" ref={dropdownRef}>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {user ? (
          <div className="flex items-center gap-4">
            {/* Role Switch Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <span className="text-sm">
                  {ROLES.find(r => r.role === user.role)?.name || 'Role'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                  {ROLES.map(role => (
                    <button
                      key={role.role}
                      onClick={() => switchRole(role.role)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {role.icon} {role.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none"
              >
                <img
                  src="/profile.png"
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/ffffff?text=U'; }}
                />
                <span className="hidden sm:inline text-sm">
                  {user.firstName || user.phone.slice(-4)}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowProfileDropdown(false)}
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
          </div>
        ) : (
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
