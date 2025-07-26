"use client"; // Ensure HomePage is also client-side if it directly uses client components

import ShinyText from "../components/ShinyText"; // correct path as needed
import "./globals.css"; // Global styles
import LightRays from "../components/LightRays"; // Background component
import Navbar from "../components/Navbar"; // Navbar component
import MapComponent from "../components/MapComponent"; // Import the new MapComponent

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      {/* Navbar will float above everything due to its fixed position and high z-index */}
      <Navbar />

      {/* LightRays as background, positioned absolutely to fill the entire main area */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} // Explicit z-index 0
      />

      {/* Main content wrapper - absolute, filling the screen, with padding for Navbar */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4"
        style={{ paddingTop: "60px" }} // Dynamic padding-top to clear Navbar height (assuming 60px)
      >
        {/* Inner content container with max-width and internal flex layout */}
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start gap-12 py-8">
          {/* LEFT SIDE: Text + Form */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-left">
            <div className="text-center lg:text-left">
              <ShinyText
                text=" Be Calm and Ride with"
                disabled={false}
                speed={3}
                className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-4"
              />

              <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-6">
                <span className="bg-gradient-to-r from-yellow-100 via-amber-500 to-yellow-500 text-transparent bg-clip-text">
                  Zatse
                </span>
              </h1>
            </div>
            <form className="space-y-4 w-full max-w-md mt-8">
              <div className="flex flex-col gap-8">
                <input
                  type="text"
                  placeholder="Pickup location"
                  className="w-full px-4 py-3 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <input
                  type="text"
                  placeholder="Dropoff location"
                  className="w-full px-4 py-3 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white dark:bg-white hover:bg-yellow-500 dark:text-black py-3 rounded-lg font-semibold dark:hover:bg-yellow-500 dark:hover:text-black transition"
              >
                Book a Ride
              </button>
            </form>
          </div>

          {/* Right side: map */}
          <div className="w-full lg:w-1/2 flex justify-center mt-8 lg:mt-0">
            <MapComponent /> {/* Your map component goes here */}
          </div>
        </div>
      </div>
    </main>
  );
}
