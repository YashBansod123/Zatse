"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMapEvents, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";

// IMPORTANT: Leaflet icon fix must run only on the client
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
      onLocationSelect(activeLocationInput, e.latlng);
    },
    locationfound: (e) => {
      if (activeLocationInput === 'pickup') {
        onLocationSelect('pickup', e.latlng);
        map.flyTo(e.latlng, 15);
      }
    },
    load: () => {
      map.locate({ setView: false, maxZoom: 16 });
    }
  });

  // Effect to update map center when pickupLocation changes (e.g., from text search or initial geo)
  useEffect(() => {
    if (pickupLocation && (map.getCenter().lat !== pickupLocation.lat || map.getCenter().lng !== pickupLocation.lng)) {
      map.flyTo(pickupLocation, 15); // Use flyTo for a smoother transition and zoom to 15
    }
  }, [pickupLocation, map]);

  // Effect to update map center when dropoffLocation changes (e.g., from text search)
  useEffect(() => {
    if (dropoffLocation && (map.getCenter().lat !== dropoffLocation.lat || map.getCenter().lng !== dropoffLocation.lng)) {
      if (pickupLocation || activeLocationInput === 'dropoff') {
         map.flyTo(dropoffLocation, 15); // Use flyTo for a smoother transition and zoom to 15
      }
    }
  }, [dropoffLocation, map, pickupLocation, activeLocationInput]);


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
  const [mapCenter, setMapCenter] = useState(initialPickupLocation || DEFAULT_MAP_LOCATION);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Crucial: This useEffect updates mapCenter whenever initialPickupLocation changes from the parent
  useEffect(() => {
    if (initialPickupLocation) {
      // Only update if the new location is different to avoid unnecessary re-renders
      if (mapCenter.lat !== initialPickupLocation.lat || mapCenter.lng !== initialPickupLocation.lng) {
        setMapCenter(initialPickupLocation);
      }
    } else {
      // If initialPickupLocation becomes null (e.g., user clears input), revert to default center
      setMapCenter(DEFAULT_MAP_LOCATION);
    }
  }, [initialPickupLocation, mapCenter]); // Add mapCenter to dependencies to avoid stale closure issues

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      {mapLoaded && (
        <MapContainer
          center={mapCenter} // This prop controls the initial center and updates when mapCenter state changes
          zoom={13} // Initial zoom, but flyTo will override this
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
      )}
    </div>
  );
}

export default MapComponent;
