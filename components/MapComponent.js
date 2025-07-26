"use client"; // This component should always be client-side

import { useEffect, useState } from "react";
// No more dynamic imports for MapContainer/TileLayer here, as the whole component will be dynamic
import { MapContainer, TileLayer } from "react-leaflet"; 

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";


function MapComponent() {
  const [userLocation, setUserLocation] = useState([21.2514, 81.6296]); // Default Raipur

  useEffect(() => {
    // IMPORTANT: Leaflet icon fix must run only on the client
    if (typeof window !== 'undefined') {
      const L = require('leaflet'); // Dynamically import Leaflet here
      require('leaflet/dist/images/marker-icon-2x.png');
      require('leaflet/dist/images/marker-icon.png');
      require('leaflet/dist/images/marker-shadow.png');

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
        iconUrl: 'leaflet/dist/images/marker-icon.png',
        shadowUrl: 'leaflet/dist/images/marker-shadow.png',
      });
    }

    // Geolocation logic
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={userLocation}
        zoom={13}
        scrollWheelZoom={true} // Enabled scroll wheel zoom
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Add Markers, Popups, etc. here if needed */}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
