"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import ShinyText from "../../../components/ShinyText";
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, CircleOff } from 'lucide-react';

export default function VerificationStatusPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch the user's latest status from the server
    const fetchUserStatus = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        // Redirect to login if no user is found
        router.push('/login');
        return;
      }
      
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Set initial user from localStorage
      setLoading(true);

      try {
        const res = await fetch(`http://localhost:5000/api/user/me?phone=${parsedUser.phone}`);
        if (!res.ok) {
          throw new Error('Failed to fetch user status.');
        }
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user); // Update with the latest data from the server
          localStorage.setItem('currentUser', JSON.stringify(data.user)); // Keep localStorage in sync
        } else {
          throw new Error('User data not found.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStatus();
  }, [router]);

  // Handle display based on user's role
  const renderStatus = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-xl text-gray-700 dark:text-gray-300">Checking your status...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 text-red-500">
          <CircleOff className="w-12 h-12" />
          <p className="text-xl">An error occurred: {error}</p>
        </div>
      );
    }
    
    if (user && user.role === 'driver') {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <ShinyText
            text="Congratulations!"
            disabled={false}
            speed={2}
            className="text-4xl md:text-5xl font-bold text-green-500"
          />
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Your documents have been verified. You can now start accepting rides!
          </p>
          <button
            onClick={() => router.push('/driver/dashboard')} // Navigate to the driver dashboard
            className="mt-6 bg-yellow-500 text-black py-3 px-8 rounded-full font-semibold text-lg hover:bg-yellow-600 transition"
          >
            Go to Driver Dashboard
          </button>
        </div>
      );
    }
    
    // Default to pending if role is not 'driver'
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Your documents have been submitted and are under review.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-400">
          We will notify you once the verification process is complete. Please check back later.
        </p>
      </div>
    );
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      <Navbar />
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        distortion={0.05}
        className="custom-rays"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto"
        style={{ paddingTop: "96px" }}
      >
        <div className="max-w-xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 md:p-12 text-center text-black dark:text-white border border-gray-200 dark:border-gray-700">
          {renderStatus()}
        </div>
      </div>
    </main>
  );
}
