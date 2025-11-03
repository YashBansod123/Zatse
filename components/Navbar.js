'use client';

import Link from "next/link";
import { Moon, Sun, User, Car, Shield, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false); 

  const router = useRouter();
  const dropdownRef = useRef(null);

  // Helper to check if a role exists in the user's role array
  const userHasRole = (roleToCheck) => {
    if (!user || !user.role) return false;
    // Handle both array (correct) and string (legacy/error) roles for resilience
    return Array.isArray(user.role)
      ? user.role.includes(roleToCheck)
      : user.role.toString().includes(roleToCheck); 
  };

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
      // NOTE: For demo purposes, we update the local user role.
      // In a production app, the server would handle role switching and issue a new token.
      const updatedUser = { ...user, role: [newRole] }; // For switching, we set a single role for demonstration
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
            {/* Show this dropdown ONLY if the user has more than one potential role OR is a driver/admin */}
            {(userHasRole('admin') || userHasRole('driver')) && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-sm font-semibold">
                    {/* Display the current primary role */}
                    {userHasRole('admin') ? 'Admin' : userHasRole('driver') ? 'Driver' : 'Rider'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                    {userHasRole('rider') && (
                        <button
                          onClick={() => switchRole('rider')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <User className="w-4 h-4 mr-2" /> Rider
                        </button>
                    )}
                    {userHasRole('driver') && (
                        <button
                          onClick={() => switchRole('driver')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Car className="w-4 h-4 mr-2" /> Driver
                        </button>
                    )}
                    {userHasRole('admin') && (
                        <button
                          onClick={() => switchRole('admin')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Shield className="w-4 h-4 mr-2" /> Admin
                        </button>
                    )}
                  </div>
                )}
              </div>
            )}

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
                  {user.firstName || user.phone?.slice(-4) || 'User'}
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
                  
                  {/* Driver Dashboard Link */}
                  {userHasRole('driver') && (
                    <Link
                      href="/driver/vehicle-management"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Car className="w-4 h-4 mr-2 inline-block" /> Driver Dashboard
                    </Link>
                  )}

                  {/* Admin Dashboard Link */}
                  {userHasRole('admin') && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Shield className="w-4 h-4 mr-2 inline-block" /> Admin Dashboard
                    </Link>
                  )}
                  
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