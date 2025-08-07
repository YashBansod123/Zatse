"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import ShinyText from "../../../components/ShinyText";
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function DriverDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to check if the user is a verified driver
    const checkDriverStatus = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        // Redirect to login if no user is found
        router.push('/login');
        return;
      }
      
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Set initial user from localStorage
      
      try {
        // Fetch the latest user data from the server
        const res = await fetch(`http://localhost:5000/api/user/me?phone=${parsedUser.phone}`);
        const data = await res.json();
        
        if (data.success && data.user && data.user.role === 'driver') {
          setUser(data.user); // Update with the latest data
          localStorage.setItem('currentUser', JSON.stringify(data.user)); // Keep localStorage in sync
        } else {
          // If not a verified driver, redirect them to the pending page
          router.push('/driver/verification-pending');
        }
      } catch (err) {
        console.error("Failed to fetch user status:", err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkDriverStatus();
  }, [router]);

  if (loading) {
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
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 py-8"
          style={{ paddingTop: "96px" }}
        >
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Should be handled by the redirect above
  }

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
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <ShinyText
            text={`Welcome, ${user.firstName || 'Driver'}!`}
            disabled={false}
            speed={2}
            className="text-4xl md:text-5xl font-bold text-yellow-500 mb-6"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            You are ready to drive!
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Your profile has been fully verified. Go online now to start accepting ride requests.
          </p>
          <button className="bg-green-600 text-white py-4 px-8 rounded-full font-semibold text-xl hover:bg-green-700 transition transform hover:scale-105 shadow-lg">
            Go Online
          </button>
        </div>
      </div>
    </main>
  );
}
