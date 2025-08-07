"use client";

import React, { useState } from 'react';
import Navbar from "../../../components/Navbar";
import LightRays from "../../../components/LightRays";
import ShinyText from "../../../components/ShinyText";
import { useRouter } from 'next/navigation';
import { ChevronLeft, UploadCloud } from 'lucide-react';

export default function DocumentUploadPage() {
  const router = useRouter();

  const [driverLicense, setDriverLicense] = useState(null);
  const [vehicleRC, setVehicleRC] = useState(null);
  const [vehicleInsurance, setVehicleInsurance] = useState(null);
  const [vehiclePhotos, setVehiclePhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleFileChange = (e, fileType) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fileType === 'driverLicense') {
      setDriverLicense(files[0]);
    } else if (fileType === 'vehicleRC') {
      setVehicleRC(files[0]);
    } else if (fileType === 'vehicleInsurance') {
      setVehicleInsurance(files[0]);
    } else if (fileType === 'vehiclePhotos') {
      setVehiclePhotos(Array.from(files));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!driverLicense || !vehicleRC || !vehicleInsurance || vehiclePhotos.length === 0) {
      alert("Please upload all required documents.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    // Get user ID from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      alert('User not logged in. Please log in again.');
      router.push('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    const userId = user._id;

    formData.append('userId', userId);
    formData.append('driverLicense', driverLicense);
    formData.append('vehicleRC', vehicleRC);
    formData.append('vehicleInsurance', vehicleInsurance);
    vehiclePhotos.forEach((file) => {
      // Use the same name 'vehiclePhotos' for multiple files, which Multer can handle
      formData.append(`vehiclePhotos`, file);
    });

    try {
      const res = await fetch('http://localhost:5000/api/document', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed; fetch sets it automatically for FormData
      });
      
      const result = await res.json();
      if (result.success) {
        alert("Documents submitted for verification!");
        console.log("Documents submitted:", result.documents);
        // You would then navigate to a pending verification page
        // router.push('/driver/verification-pending');
      } else {
        alert(`Error: ${result.error}`);
        console.error("Server error:", result.error);
      }
    } catch (error) {
      alert("A network error occurred. Please try again.");
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
    router.push('/driver/verification-pending'); // Navigate to vehicle selection page after submission
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
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-2xl md:text-3xl font-bold text-center">
              Upload Your Documents
            </h1>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
            Help us verify your profile by uploading the required documents.
          </p>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {[
              { id: 'driverLicense', label: 'Driver\'s License', fileState: driverLicense },
              { id: 'vehicleRC', label: 'Vehicle Registration Certificate (RC)', fileState: vehicleRC },
              { id: 'vehicleInsurance', label: 'Vehicle Insurance Papers', fileState: vehicleInsurance },
            ].map((doc) => (
              <div key={doc.id}>
                <label htmlFor={doc.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {doc.label}
                </label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor={doc.id} className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      {doc.fileState && <p className="text-xs text-green-500 mt-2">{doc.fileState.name} uploaded</p>}
                    </div>
                    <input id={doc.id} type="file" className="hidden" onChange={(e) => handleFileChange(e, doc.id)} required />
                  </label>
                </div>
              </div>
            ))}
            <div>
              <label htmlFor="vehiclePhotos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Photos (e.g., front, back, side)
              </label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="vehiclePhotos" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> (min. 3 photos)
                    </p>
                    {vehiclePhotos.length > 0 && <p className="text-xs text-green-500 mt-2">{vehiclePhotos.length} files uploaded</p>}
                  </div>
                  <input id="vehiclePhotos" type="file" className="hidden" multiple onChange={(e) => handleFileChange(e, 'vehiclePhotos')} required />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-yellow-500 text-white dark:text-black py-3 rounded-full font-semibold text-lg hover:bg-yellow-500 hover:text-black dark:hover:bg-black dark:hover:text-white transition transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Submit Documents'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
