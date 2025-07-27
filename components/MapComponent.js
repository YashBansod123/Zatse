"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMapEvents, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";

// IMPORTANT: Fix for default Leaflet icons not showing up with Webpack/Next.js
if (typeof window !== 'undefined') {
  const L = require('leaflet');
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

// Dynamically import MapContainer and TileLayer
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

// Define a default location for the map and marker
const DEFAULT_MAP_LOCATION = { lat: 21.2514, lng: 81.6296 }; // Raipur coordinates

// MapEventsHandler component to handle map clicks and location updates
function MapEventsHandler({ onLocationSelect, activeLocationInput, pickupLocation, dropoffLocation }) {
  const map = useMapEvents({
    click: (e) => {
      // Pass the clicked location and the active input type to the parent
      onLocationSelect(activeLocationInput, e.latlng);
    },
    locationfound: (e) => {
      // If geolocation is found, set it as pickup location by default
      if (activeLocationInput === 'pickup') {
        onLocationSelect('pickup', e.latlng);
        map.flyTo(e.latlng, map.getZoom()); // Fly to user's location
      }
    },
    load: () => {
      // Request user's location when the map loads
      map.locate({ setView: false, maxZoom: 16 });
    }
  });

  // Effect to update map center if initial pickup location changes from parent
  useEffect(() => {
    if (pickupLocation && map.getCenter().lat !== pickupLocation.lat && map.getCenter().lng !== pickupLocation.lng) {
      map.setView(pickupLocation, map.getZoom());
    }
  }, [pickupLocation, map]);


  return (
    <>
      {pickupLocation && (
        <Marker position={pickupLocation}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}
      {dropoffLocation && (
        <Marker position={dropoffLocation}>
          <Popup>Dropoff Location</Popup>
        </Marker>
      )}
    </>
  );
}


// Main MapComponent
function MapComponent({ onLocationSelect, initialPickupLocation, initialDropoffLocation, activeLocationInput }) {
  // Use initialPickupLocation if provided, otherwise default to Raipur for map center
  const [mapCenter, setMapCenter] = useState(initialPickupLocation || DEFAULT_MAP_LOCATION);

  // Update map center if initialPickupLocation changes from parent
  useEffect(() => {
    if (initialPickupLocation) {
      setMapCenter(initialPickupLocation);
    }
  }, [initialPickupLocation]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEventsHandler
          onLocationSelect={onLocationSelect}
          activeLocationInput={activeLocationInput}
          pickupLocation={initialPickupLocation}
          dropoffLocation={initialDropoffLocation}
        />
      </MapContainer>
    </div>
  );
}

export default MapComponent;
