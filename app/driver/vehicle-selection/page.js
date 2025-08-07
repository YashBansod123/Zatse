"use client"; // This page will handle user input and state

import React, { useState } from 'react';
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import ShinyText from "../../../components/ShinyText";
import { Car, Bike, BusFront, Truck, CarTaxiFront, ChevronLeft, ChevronDown, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VehicleSelectionPage() {
  const router = useRouter();
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [earningMode, setEarningMode] = useState('rides'); // 'rides' or 'fleet'
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);

  const vehicleTypes = [
    {
      id: 'commercial_car',
      name: 'Commercial car',
      type: 'rides',
      icon: <Car className="w-12 h-12 text-gray-700 dark:text-gray-300" />,
      description: 'Vehicle: You have a car that you wish to drive or employ others to drive.'
    },
    {
      id: 'motorbike',
      name: 'Motorbike (2 wheeler)',
      type: 'rides',
      icon: <Bike className="w-12 h-12 text-gray-700 dark:text-gray-300" />,
      description: 'Vehicle: You wish to drive a motorcycle or scooter.'
    },
    {
      id: 'auto_rickshaw',
      name: 'Auto Rickshaw',
      type: 'rides',
      icon: <CarTaxiFront className="w-12 h-12 text-gray-700 dark:text-gray-300" />,
      description: 'Vehicle: You wish to drive an auto rickshaw.'
    },
    {
      id: 'commercial_truck',
      name: 'Commercial Truck',
      type: 'fleet',
      icon: <Truck className="w-12 h-12 text-gray-700 dark:text-gray-300" />,
      description: 'Vehicle: You wish to drive a commercial truck for goods transport.'
    },
    {
      id: 'commercial_bus',
      name: 'Bus/Van (Commercial)',
      type: 'fleet',
      icon: <BusFront className="w-12 h-12 text-gray-700 dark:text-gray-300" />,
      description: 'Vehicle: You wish to drive a bus or van for passenger transport.'
    },
  ];

  const handleSelectVehicle = (typeId) => {
    setSelectedVehicleType(typeId);
  };

  const handleContinue = () => {
    if (!selectedVehicleType) {
      alert("Please select a vehicle type to continue.");
      return;
    }
    console.log("Selected Vehicle Type:", selectedVehicleType);
    alert(`You selected: ${selectedVehicleType.toUpperCase()}. Proceeding to next step (simulated).`);
    router.push(`/driver/vehicle-details?page=vehicle&type=${selectedVehicleType}`); // Navigate to vehicle details page with selected type
  };

  const filteredVehicleTypes = vehicleTypes.filter(
    (type) => type.type === earningMode
  );

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

      {/* Main content wrapper */}
      {/* Removed justify-center to allow content to flow naturally from the top */}
      {/* Increased paddingTop to create a clear margin below the Navbar */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center px-4 py-8 overflow-y-auto"
        style={{ paddingTop: "96px" }} // Increased padding-top for a clear margin below Navbar (60px Navbar + 36px buffer)
      >
        <div className="max-w-xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-8 text-black dark:text-white border border-gray-200 dark:border-gray-700">
          {/* Top Bar: Back Arrow and Help */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                className="flex items-center px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Help <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showHelpDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowHelpDropdown(false)}
                  >
                    <HelpCircle className="inline-block w-4 h-4 mr-2" /> Get Support
                  </a>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-left mb-6">
            Choose how you want to earn with Zatse
          </h1>

          {/* Rides/Fleet Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 mb-6">
            <button
              onClick={() => setEarningMode('rides')}
              className={`flex-1 py-2 rounded-full text-lg font-semibold transition-all duration-200
                ${earningMode === 'rides'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Rides
            </button>
            <button
              onClick={() => setEarningMode('fleet')}
              className={`flex-1 py-2 rounded-full text-lg font-semibold transition-all duration-200
                ${earningMode === 'fleet'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Fleet
            </button>
          </div>

          {/* Vehicle Type Selection Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {filteredVehicleTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelectVehicle(type.id)}
                className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${selectedVehicleType === type.id
                    ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 shadow-lg'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-yellow-400 hover:shadow-md'
                  }`}
              >
                <div className="flex-shrink-0 mr-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  {type.icon}
                </div>
                <div>
                  <span className="text-xl font-semibold block">{type.name}</span>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{type.description}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-black dark:bg-yellow-500 text-white dark:text-black py-3 rounded-full font-semibold text-lg hover:bg-yellow-500 hover:text-black dark:hover:bg-black dark:hover:text-white transition transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
