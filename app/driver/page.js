"use client";

import React from 'react';
import Navbar from "../../components/Navbar";
import LightRays from "../../components/LightRays";
import ShinyText from "../../components/ShinyText";
import { useRouter } from 'next/navigation'; // Assuming you are using Next.js routing
export default function DriverPage() {
  const router = useRouter();
  const handleSignUp = () => {
    // Navigate to the driver registration form or sign-up page
    router.push('/driver/vehicle-selection');
  };

  return (
    
    // This structure is based on your HomePage.js
    // 'relative' creates the container for the absolute layers.
    <main className="min-h-screen relative bg-black">
      
      {/* Navbar sits on top */}
      <Navbar />

      {/* LightRays background layer, positioned absolutely behind everything */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        distortion={0.05}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      {/* THE FIX: The main content wrapper.
        - 'absolute inset-0' makes it fill the screen, just like your HomePage.
        - 'z-10' places it on top of the background.
        - 'overflow-y-auto' is added to make this layer scrollable for your long content.
      */}
      <div className="absolute inset-0 z-10 overflow-y-auto">
        
        {/* This inner div handles the padding and centers the content card horizontally.
            'pt-24' creates space for the Navbar at the top.
            'pb-12' gives some breathing room at the bottom.
        */}
        <div className="flex flex-col items-center px-4 pt-24 pb-12">
            
          {/* Your original DriverPage content card fits right in here */}
          <div className="max-w-4xl w-full bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 md:p-12 text-center border border-gray-700">
            <ShinyText
              text="Drive with Zatse"
              className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4"
            />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              Earn Money on Your Own Schedule
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our growing community of drivers and turn your car into an earning opportunity. Whether you're looking for a side hustle or a full-time gig, Zatse offers flexibility and competitive earnings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-2xl font-semibold text-yellow-500 mb-3">Flexibility</h3>
                <p className="text-gray-300">
                  Drive when you want, where you want. Set your own hours and be your own boss.
                </p>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-2xl font-semibold text-yellow-500 mb-3">Great Earnings</h3>
                <p className="text-gray-300">
                  Competitive rates and transparent earnings. See what you'll make before you accept a ride.
                </p>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-2xl font-semibold text-yellow-500 mb-3">Easy to Use App</h3>
                <p className="text-gray-300">
                  Our intuitive app makes it simple to find rides, navigate, and manage your earnings.
                </p>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-2xl font-semibold text-yellow-500 mb-3">24/7 Support</h3>
                <p className="text-gray-300">
                  We're here to help you every step of the way with dedicated driver support.
                </p>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Ready to Drive?</h2>
            <button  onClick={handleSignUp} className="bg-yellow-500 text-black py-4 px-8 rounded-full font-semibold text-xl hover:bg-black hover:text-white transition transform hover:scale-105 shadow-lg">
              Sign Up to Drive
            </button>
            <p className="text-sm text-gray-400 mt-4">
              (Link to a driver registration form coming soon!)
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}