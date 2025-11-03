"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import { Loader2, Car, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VehicleManagementPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch User and Vehicle Data on Load
    useEffect(() => {
        const fetchVehicleData = async () => {
            const storedUser = localStorage.getItem('currentUser');
            if (!storedUser) {
                router.push('/login');
                return;
            }
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            if (!parsedUser.vehicle) {
                setError("No vehicle linked. Please start the driver onboarding process.");
                setLoading(false);
                return;
            }
            
            try {
                // Fetch vehicle data using the new /api/vehicle/me endpoint
                const res = await fetch('http://localhost:5000/api/vehicle/me', {
                    method: 'GET',
                    headers: {
                        'x-user-id': parsedUser._id, // Pass user ID for authentication
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch vehicle details.');
                }
                const data = await res.json();
                
                if (data.success && data.vehicle) {
                    setVehicle(data.vehicle);
                } else {
                    setError("Vehicle data not found.");
                }

            } catch (err) {
                console.error("Error fetching vehicle:", err);
                setError("Network error or vehicle data is unavailable.");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicleData();
    }, [router]);

    // Helper to render the driver badge
    const renderDriverBadge = () => {
        if (!user || !user.role.includes('driver')) return null;

        return (
            <div className="text-sm px-3 py-1 bg-green-600 rounded-full text-white font-semibold self-start mb-4">
                Verified Driver
            </div>
        );
    };

    const renderDataField = (label, value) => (
        <div className="flex justify-between items-center py-3 border-b border-gray-300 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-400">{label}</span>
            <span className="font-semibold text-black dark:text-white">{value}</span>
        </div>
    );

    // RENDER LOGIC
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
            </div>
        );
    }
    
    return (
        <main className="min-h-screen relative overflow-hidden bg-black transition-colors duration-300">
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
            <div className="absolute inset-0 z-10 flex flex-col items-center px-4 py-8 overflow-y-auto" style={{ paddingTop: "96px" }}>
                <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                    
                    {error && <div className="text-red-500 p-4 border border-red-500 rounded-lg">{error}</div>}

                    {vehicle ? (
                        <>
                            <Car className="w-16 h-16 text-yellow-500 mb-2" />
                            <h1 className="text-3xl font-bold mb-1 text-black dark:text-white">
                                {vehicle.type.toUpperCase()} Details
                            </h1>
                            {renderDriverBadge()}
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                                This is the vehicle currently registered to your account.
                            </p>
                            
                            <div className="w-full space-y-2">
                                {renderDataField("Status", <span className={`font-bold ${vehicle.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>{vehicle.status.toUpperCase()}</span>)}
                                {renderDataField("Make", vehicle.make)}
                                {renderDataField("Model", vehicle.model)}
                                {renderDataField("License Plate", vehicle.licensePlate)}
                                {renderDataField("Color", vehicle.color)}
                            </div>

                            <button
                                onClick={() => router.push(`/driver/vehicle-selection`)}
                                className="mt-8 flex items-center justify-center w-full bg-yellow-500 text-black py-3 rounded-full font-semibold hover:bg-yellow-600 transition"
                            >
                                <Pencil className="w-5 h-5 mr-2" /> Change Vehicle
                            </button>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <h1 className="text-2xl font-bold mb-4">No Vehicle Found</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Please submit your vehicle details to start the verification process.
                            </p>
                            <button
                                onClick={() => router.push(`/driver/vehicle-selection`)}
                                className="w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition"
                            >
                                Start Vehicle Submission
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}