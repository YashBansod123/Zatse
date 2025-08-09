"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ShinyText from "../components/ShinyText"; // correct path as needed
import "./globals.css";
import LightRays from "../components/LightRays";
import Navbar from "../components/Navbar"; // Assuming Navbar is used here
import dynamic from "next/dynamic";

// Dynamically import MapComponent
const DynamicMapComponent = dynamic(
  () => import("../components/MapComponent"),
  { ssr: false } // Crucial: This component will not be rendered on the server
);

export default function HomePage() {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [pickupLocationText, setPickupLocationText] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);

  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [dropoffLocationText, setDropoffLocationText] = useState("");
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  
  const [onlineDrivers, setOnlineDrivers] = useState([]);

  const [activeLocationInput, setActiveLocationInput] = useState('pickup');

  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const performSearch = useCallback(async (query, setSuggestions, currentLocation = null) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      let apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`;

      if (currentLocation && typeof currentLocation.lat === 'number' && typeof currentLocation.lng === 'number') {
        const delta = 0.1;
        const minLat = currentLocation.lat - delta;
        const maxLat = currentLocation.lat + delta;
        const minLng = currentLocation.lng - delta;
        const maxLng = currentLocation.lng + delta;
        apiUrl += `&viewbox=${minLng},${minLat},${maxLng},${maxLat}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Zatse-Rideshare-App'
        }
      });
      const data = await response.json();
      const newSuggestions = data.map(item => item.display_name);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Geocoding search failed:", error);
      setSuggestions([]);
    }
  }, []);

  const debouncedSearch = useCallback(debounce(performSearch, 500), [performSearch]);
  const debouncedPickupSearch = useCallback((query, setSuggestions) => {
    debouncedSearch(query, setSuggestions, pickupLocation);
  }, [debouncedSearch, pickupLocation]);
  const debouncedDropoffSearch = useCallback((query, setSuggestions) => {
    debouncedSearch(query, setSuggestions, pickupLocation);
  }, [debouncedSearch, pickupLocation]);

  const fetchOnlineDrivers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/driver/online');
      const data = await res.json();
      if (data.success && data.drivers) {
        setOnlineDrivers(data.drivers);
      }
    } catch (error) {
      console.error("Failed to fetch online drivers:", error);
    }
  };

  const handleLocationSelectedFromMap = async (type, location) => {
    let latLng = null;
    if (Array.isArray(location)) {
      latLng = { lat: location[0], lng: location[1] };
    } else if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      latLng = location;
    } else {
      console.warn("Invalid location format received:", location);
      return;
    }

    let addressText = `Lat: ${latLng.lat.toFixed(4)}, Lng: ${latLng.lng.toFixed(4)}`;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}&zoom=18&addressdetails=1&countrycodes=in`, {
        headers: { 'User-Agent': 'Zatse-Rideshare-App' }
      });
      const data = await response.json();
      if (data && data.display_name) {
        addressText = data.display_name;
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }

    if (type === 'pickup') {
      setPickupLocation(latLng);
      setPickupLocationText(addressText);
    } else if (type === 'dropoff') {
      setDropoffLocation(latLng);
      setDropoffLocationText(addressText);
    }
  };

  useEffect(() => {
    if (navigator.geolocation && !pickupLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          handleLocationSelectedFromMap('pickup', newLocation);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setPickupLocationText("Getting current location or click on map...");
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchOnlineDrivers();
    const intervalId = setInterval(fetchOnlineDrivers, 5000);
    return () => clearInterval(intervalId);
  }, []);


  const handlePickupTextChange = (e) => {
    const value = e.target.value;
    setPickupLocationText(value);
    setPickupLocation(null);

    debouncedPickupSearch(value, setPickupSuggestions);
    if (value.length > 2) {
      setShowPickupSuggestions(true);
    } else {
      setShowPickupSuggestions(false);
      setPickupSuggestions([]);
      if (value.length === 0) {
        setPickupLocation(null);
      }
    }
  };

  const handlePickupSuggestionClick = async (suggestion) => {
    setPickupLocationText(suggestion);
    setPickupSuggestions([]);
    setShowPickupSuggestions(false);

    try {
      let apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suggestion)}&limit=1&countrycodes=in&addressdetails=1`;
      if (pickupLocation && typeof pickupLocation.lat === 'number' && typeof pickupLocation.lng === 'number') {
        const delta = 0.1;
        const minLat = pickupLocation.lat - delta;
        const maxLat = pickupLocation.lat + delta;
        const minLng = pickupLocation.lng - delta;
        const maxLng = pickupLocation.lng + delta;
        apiUrl += `&viewbox=${minLng},${minLat},${maxLng},${maxLat}`;
      }

      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Zatse-Rideshare-App' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        const latLng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setPickupLocation(latLng);
      } else {
        setPickupLocation(null);
        console.warn("No coordinates found for pickup suggestion:", suggestion);
      }
    } catch (error) {
      console.error("Forward geocoding failed for pickup:", error);
      setPickupLocation(null);
    }
  };

  const handleDropoffTextChange = (e) => {
    const value = e.target.value;
    setDropoffLocationText(value);
    setDropoffLocation(null);

    debouncedDropoffSearch(value, setDropoffSuggestions);
    if (value.length > 2) {
      setShowDropoffSuggestions(true);
    } else {
      setShowDropoffSuggestions(false);
      setDropoffSuggestions([]);
      if (value.length === 0) {
        setDropoffLocation(null);
      }
    }
  };

  const handleDropoffSuggestionClick = async (suggestion) => {
    setDropoffLocationText(suggestion);
    setDropoffSuggestions([]);
    setShowDropoffSuggestions(false);

    try {
      let apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suggestion)}&limit=1&countrycodes=in&addressdetails=1`;
      if (pickupLocation && typeof pickupLocation.lat === 'number' && typeof pickupLocation.lng === 'number') {
        const delta = 0.1;
        const minLat = pickupLocation.lat - delta;
        const maxLat = pickupLocation.lat + delta;
        const minLng = pickupLocation.lng - delta;
        const maxLng = pickupLocation.lng + delta;
        apiUrl += `&viewbox=${minLng},${minLat},${maxLng},${maxLat}`;
      }

      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Zatse-Rideshare-App' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        const latLng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setDropoffLocation(latLng);
      } else {
        setDropoffLocation(null);
        console.warn("No coordinates found for dropoff suggestion:", suggestion);
      }
    } catch (error) {
      console.error("Forward geocoding failed for dropoff:", error);
      setDropoffLocation(null);
    }
  };

  const handleClickOutside = (event) => {
    if (dropoffInputRef.current && !dropoffInputRef.current.contains(event.target)) {
      setShowDropoffSuggestions(false);
    }
    if (pickupInputRef.current && !pickupInputRef.current.contains(event.target)) {
      setShowPickupSuggestions(false);
    }
  };
  useEffect(() => {
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
                    onFocus={() => { setActiveLocationInput('pickup'); setShowPickupSuggestions(true); }}
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
                    onFocus={() => { setActiveLocationInput('dropoff'); setShowDropoffSuggestions(true); }}
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
              onlineDrivers={onlineDrivers} // Pass online drivers to the map
            />
          </div>
        </div>
      </div>
    </main>
  );
}