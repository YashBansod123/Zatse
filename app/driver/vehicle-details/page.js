"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import ShinyText from "../../../components/ShinyText";
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function VehicleDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleType = searchParams.get('type') || 'vehicle';

  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleMake || !vehicleModel || !licensePlate || !vehicleColor) {
      alert("Please fill out all fields.");
      return;
    }
    
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      alert('User not logged in. Please log in again.');
      router.push('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    const userId = user._id;

    const vehicleData = {
      userId,
      type: vehicleType,
      make: vehicleMake,
      model: vehicleModel,
      licensePlate,
      color: vehicleColor
    };

    try {
      const res = await fetch('http://localhost:5000/api/vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      const result = await res.json();
      if (result.success) {
        alert("Vehicle details submitted successfully!");
        console.log("Submitted Vehicle Data:", result.vehicle);
      } else {
        alert(`Error: ${result.error}`);
        console.error("Server error:", result.error);
      }
    } catch (error) {
      alert("A network error occurred. Please try again.");
      console.error("Network error:", error);
    }
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
        className="absolute inset-0 z-10 flex flex-col items-center px-4 py-8 overflow-y-auto"
        style={{ paddingTop: "96px" }}
      >
        <div className="max-w-xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-8 text-black dark:text-white border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-2xl md:text-3xl font-bold text-center">
              Enter Your {vehicleType.toUpperCase()} Details
            </h1>
          </div>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
            Help us verify your vehicle by providing the following information.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Make (e.g., Maruti, Honda)
              </label>
              <input
                type="text"
                id="vehicleMake"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div>
              <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Model (e.g., Swift, City)
              </label>
              <input
                type="text"
                id="vehicleModel"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License Plate Number
              </label>
              <input
                type="text"
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div>
              <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Color
              </label>
              <input
                type="text"
                id="vehicleColor"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black dark:bg-yellow-500 text-white dark:text-black py-3 rounded-full font-semibold text-lg hover:bg-yellow-500 hover:text-black dark:hover:bg-black dark:hover:text-white transition transform hover:scale-105 shadow-lg"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
