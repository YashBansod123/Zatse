// components/MapPicker.js
"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import L from 'leaflet';

// Fix for default marker icon not showing
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

function LocationMarker({ setPickup, setDrop }) {
  const [clickCount, setClickCount] = useState(0);

  useMapEvents({
    click(e) {
      if (clickCount === 0) {
        setPickup(e.latlng);
        setClickCount(1);
      } else if (clickCount === 1) {
        setDrop(e.latlng);
        setClickCount(2);
      } else {
        // reset if both already selected
        setPickup(null);
        setDrop(null);
        setClickCount(0);
      }
    },
  });

  return null;
}

export default function MapPicker() {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);

  return (
    <div className="w-full h-[600px] relative z-10">
      <MapContainer center={[21.1458, 79.0882]} zoom={13} scrollWheelZoom={true} className="w-full h-full z-0 rounded-xl">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setPickup={setPickup} setDrop={setDrop} />
        {pickup && <Marker position={pickup} />}
        {drop && <Marker position={drop} />}
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow text-black">
        <p><strong>Pickup:</strong> {pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : 'Select on map'}</p>
        <p><strong>Drop:</strong> {drop ? `${drop.lat.toFixed(4)}, ${drop.lng.toFixed(4)}` : 'Select on map'}</p>
      </div>
    </div>
  );
}
