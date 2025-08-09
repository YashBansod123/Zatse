"use client";

import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import ShinyText from "../../../components/ShinyText";
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function DriverDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const locationIntervalRef = useRef(null);
  
  // 👉 UPDATED: Function to send location updates to the server
  const sendLocationUpdate = async (latitude, longitude) => {
    if (!user || !user._id) return; // Ensure user is available before sending

    try {
      const res = await fetch('http://localhost:5000/api/driver/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user._id, // Use the user ID for authentication
        },
        body: JSON.stringify({ latitude, longitude, userId: user._id }),
      });
      const result = await res.json();
      if (!result.success) {
        console.error("Failed to send location update:", result.error);
      }
    } catch (error) {
      console.error("Network error sending location:", error);
    }
  };

  useEffect(() => {
    const checkDriverStatus = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      try {
        const res = await fetch(`http://localhost:5000/api/user/me?phone=${parsedUser.phone}`);
        const data = await res.json();
        if (data.success && data.user && data.user.role.includes('driver')) {
          setUser(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          setIsOnline(data.user.status === 'online');
        } else {
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

  // useEffect to start/stop location tracking based on isOnline status
  useEffect(() => {
    if (isOnline && navigator.geolocation) {
      locationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sendLocationUpdate(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error("Geolocation error:", error);
          }
        );
      }, 5000); // Send update every 5 seconds
    } else {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    }
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [isOnline, user]); // Depend on isOnline and user

  const handleStatusChange = async () => {
    setStatusUpdating(true);
    const newStatus = isOnline ? 'offline' : 'online';
    
    try {
      const res = await fetch('http://localhost:5000/api/driver/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user._id,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await res.json();
      if (result.success) {
        setIsOnline(newStatus === 'online');
        alert(result.message);
      } else {
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (err) {
      alert("A network error occurred. Please try again.");
    } finally {
      setStatusUpdating(false);
    }
  };

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
    return null;
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
          <button
            onClick={handleStatusChange}
            disabled={statusUpdating}
            className={`w-full py-4 px-8 rounded-full font-semibold text-xl transition transform hover:scale-105 shadow-lg
              ${isOnline
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {statusUpdating ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Updating...
              </span>
            ) : isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>
    </main>
  );
}
