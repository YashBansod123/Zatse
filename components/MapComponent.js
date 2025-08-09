"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMapEvents } from "react-leaflet";
import { Bike, LocateFixed } from 'lucide-react';

import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons
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
  
  L.icon = function(options) {
    return new L.Icon(options);
  };
}

// Dynamically import ALL Leaflet components to ensure they are client-side only
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const DEFAULT_MAP_LOCATION = { lat: 21.2514, lng: 81.6296 }; // Raipur coordinates


function MapEventsHandler({ onLocationSelect, activeLocationInput, pickupLocation, dropoffLocation, onlineDrivers }) {
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

  useEffect(() => {
    if (pickupLocation && (map.getCenter().lat !== pickupLocation.lat || map.getCenter().lng !== pickupLocation.lng)) {
      map.flyTo(pickupLocation, 15);
    }
  }, [pickupLocation, map]);

  useEffect(() => {
    if (dropoffLocation && (map.getCenter().lat !== dropoffLocation.lat || map.getCenter().lng !== dropoffLocation.lng)) {
      if (pickupLocation || activeLocationInput === 'dropoff') {
         map.flyTo(dropoffLocation, 15);
      }
    }
  }, [dropoffLocation, map, pickupLocation, activeLocationInput]);

  const bikeIcon = typeof window !== 'undefined' ? L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bike"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6s1 4-4 6H4"/><path d="m9 18-1.5-6.5C8.8 8.8 9.8 7 8 5.5"/><path d="m15 6-3 7h3l3 2"/></svg>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }) : null;
  

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

      {onlineDrivers && onlineDrivers.map(driver => driver.location && (
        <Marker 
          key={driver._id} 
          position={[driver.location.latitude, driver.location.longitude]}
          icon={bikeIcon}
        >
          <Popup>{driver.firstName || 'Driver'} is here!</Popup>
        </Marker>
      ))}
    </>
  );
}


function MapComponent({ onLocationSelect, initialPickupLocation, initialDropoffLocation, activeLocationInput, onlineDrivers }) {
  const [mapCenter, setMapCenter] = useState(initialPickupLocation || DEFAULT_MAP_LOCATION);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (initialPickupLocation) {
      if (mapCenter.lat !== initialPickupLocation.lat || mapCenter.lng !== initialPickupLocation.lng) {
        setMapCenter(initialPickupLocation);
      }
    } else {
      setMapCenter(DEFAULT_MAP_LOCATION);
    }
  }, [initialPickupLocation, mapCenter]);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      {mapLoaded && (
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
            onlineDrivers={onlineDrivers}
          />
        </MapContainer>
      )}
    </div>
  );
}

export default MapComponent;
