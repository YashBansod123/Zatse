"use client";

import { useState, useEffect, useRef } from "react";
import ShinyText from "../components/ShinyText";
import "./globals.css";
import LightRays from "../components/LightRays";
import Navbar from "../components/Navbar";
import dynamic from "next/dynamic";

// Dynamically import MapComponent
const DynamicMapComponent = dynamic(
  () => import("../components/MapComponent"),
  { ssr: false }
);

// Simulated Geocoding Data (Replace with a real API call for production)
const ALL_LOCATIONS = [
  "Raipur, Chhattisgarh, India",
  "Nagpur, Maharashtra, India",
  "Bhilai, Chhattisgarh, India",
  "Durg, Chhattisgarh, India",
  "Bilaspur, Chhattisgarh, India",
  "Delhi, India",
  "Mumbai, Maharashtra, India",
  "Bangalore, Karnataka, India",
  "Hyderabad, Telangana, India",
  "Chennai, Tamil Nadu, India",
  "Kolkata, West Bengal, India",
  "Amanaka, Raipur, Chhattisgarh, India",
  "Aman Men's Parlour, Amanaka, Raipur, Chhattisgarh, India",
  "Amantran Beauty Parlour, Recreation Rd, Jain Mandir Galli, Choubey Colony, Ramkund, Raipur, Chhattisgarh, India",
];

export default function HomePage() {
  const [pickupLocation, setPickupLocation] = useState(null); // Stores {lat, lng} object for pickup
  const [pickupLocationText, setPickupLocationText] = useState(""); // Stores display text for pickup
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);

  const [dropoffLocation, setDropoffLocation] = useState(null); // Stores {lat, lng} object for dropoff
  const [dropoffLocationText, setDropoffLocationText] = useState(""); // Stores display text for dropoff
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // State to track which input is active for map selection
  const [activeLocationInput, setActiveLocationInput] = useState('pickup'); // 'pickup' or 'dropoff'

  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  // Unified function to handle location selection from map/geolocation
  const handleLocationSelectedFromMap = async (type, location) => {
    let latLng = null;
    if (Array.isArray(location)) {
      latLng = { lat: location[0], lng: location[1] };
    } else if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      latLng = location;
    } else {
      console.warn("Invalid location format received:", location);
      return; // Exit if location is invalid
    }

    // --- REVERSE GEOCODING INTEGRATION POINT ---
    let addressText = `Lat: ${latLng.lat.toFixed(4)}, Lng: ${latLng.lng.toFixed(4)}`;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        addressText = data.display_name;
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
    // --- END REVERSE GEOCODING ---

    if (type === 'pickup') {
      setPickupLocation(latLng);
      setPickupLocationText(addressText);
    } else if (type === 'dropoff') {
      setDropoffLocation(latLng);
      setDropoffLocationText(addressText);
    }
  };

  // Effect to handle initial geolocation for pickup location on mount
  useEffect(() => {
    if (navigator.geolocation && !pickupLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          handleLocationSelectedFromMap('pickup', newLocation); // Set initial pickup
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to default if geo fails, but still set a default text
          setPickupLocationText("Getting current location or click on map...");
        }
      );
    }
  }, []); // Empty dependency array to run only once on mount

  // --- Pickup Location Search Handlers ---
  const handlePickupTextChange = (e) => {
    const value = e.target.value;
    setPickupLocationText(value); // Update input text directly
    setPickupLocation(null); // Clear map location when typing

    if (value.length > 2) {
      const filteredSuggestions = ALL_LOCATIONS.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setPickupSuggestions(filteredSuggestions);
      setShowPickupSuggestions(true);
    } else {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    }
  };

  const handlePickupSuggestionClick = async (suggestion) => {
    setPickupLocationText(suggestion); // Set input text to selected suggestion
    setPickupSuggestions([]);
    setShowPickupSuggestions(false);

    // --- FORWARD GEOCODING INTEGRATION POINT ---
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suggestion)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const latLng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setPickupLocation(latLng);
      } else {
        setPickupLocation(null); // No coordinates found for this suggestion
      }
    } catch (error) {
      console.error("Forward geocoding failed for pickup:", error);
      setPickupLocation(null);
    }
    // --- END FORWARD GEOCODING ---
  };

  // --- Dropoff Location Search Handlers ---
  const handleDropoffTextChange = (e) => {
    const value = e.target.value;
    setDropoffLocationText(value);
    setDropoffLocation(null); // Clear map location when typing

    if (value.length > 2) {
      const filteredSuggestions = ALL_LOCATIONS.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setDropoffSuggestions(filteredSuggestions);
      setShowDropoffSuggestions(true);
    } else {
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
    }
  };

  const handleDropoffSuggestionClick = async (suggestion) => {
    setDropoffLocationText(suggestion);
    setDropoffSuggestions([]);
    setShowDropoffSuggestions(false);

    // --- FORWARD GEOCODING INTEGRATION POINT ---
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suggestion)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const latLng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setDropoffLocation(latLng);
      } else {
        setDropoffLocation(null); // No coordinates found for this suggestion
      }
    } catch (error) {
      console.error("Forward geocoding failed for dropoff:", error);
      setDropoffLocation(null);
    }
    // --- END FORWARD GEOCODING ---
  };

  // Close suggestions when clicking outside the input/suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropoffInputRef.current && !dropoffInputRef.current.contains(event.target)) {
        setShowDropoffSuggestions(false);
      }
      if (pickupInputRef.current && !pickupInputRef.current.contains(event.target)) {
        setShowPickupSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleBookRide = (e) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation) {
      alert("Please select both pickup and dropoff locations.");
      return;
    }
    console.log("Booking ride from:", pickupLocationText, "to:", dropoffLocationText);
    console.log("Pickup Coords:", pickupLocation);
    console.log("Dropoff Coords:", dropoffLocation);
    // Here you would integrate with your backend to book the ride
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
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4"
        style={{ paddingTop: "60px" }}
      >
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
            <form onSubmit={handleBookRide} className="space-y-4 w-full max-w-md">
              <div className="flex flex-col gap-8">
                <div className="relative" ref={pickupInputRef}>
                  <input
                    type="text"
                    placeholder="Pickup location (Type or click on map)"
                    value={pickupLocationText}
                    onChange={handlePickupTextChange}
                    onFocus={() => { setActiveLocationInput('pickup'); setShowPickupSuggestions(true); }} // Set active input on focus
                    className="w-full px-4 py-3 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {pickupSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onMouseDown={() => handlePickupSuggestionClick(suggestion)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="relative" ref={dropoffInputRef}>
                  <input
                    type="text"
                    placeholder="Dropoff location"
                    value={dropoffLocationText}
                    onChange={handleDropoffTextChange}
                    onFocus={() => { setActiveLocationInput('dropoff'); setShowDropoffSuggestions(true); }} // Set active input on focus
                    className="w-full px-4 py-3 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {dropoffSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onMouseDown={() => handleDropoffSuggestionClick(suggestion)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
          <div className="w-full lg:w-1/2 flex justify-center mt-8 lg:mt-0 h-[400px]">
            <DynamicMapComponent
              onLocationSelect={handleLocationSelectedFromMap}
              activeLocationInput={activeLocationInput}
              initialPickupLocation={pickupLocation}
              initialDropoffLocation={dropoffLocation}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
