import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); animation: pulse-ring 2s infinite;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const pickupIcon = createCustomIcon('#10b981'); 
const dropoffIcon = createCustomIcon('#ef4444');

function MapEvents({ onClick, isActive }) {
  useMapEvents({
    click(e) {
      if (!isActive) return;
      const { lat, lng } = e.latlng;
      onClick(lat, lng);
    },
  });
  return null;
}

function MapUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      const leafletBounds = L.latLngBounds(
        [bounds.lat_min, bounds.lng_min],
        [bounds.lat_max, bounds.lng_max]
      );
      map.fitBounds(leafletBounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  return null;
}

function MarkerFlyTo({ pickup, dropoff }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lng], 14, { duration: 1.5 });
    } else if (dropoff) {
      map.flyTo([dropoff.lat, dropoff.lng], 14, { duration: 1.5 });
    }
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, map, pickup, dropoff]);
  return null;
}

export default function MapSelector({ bounds, onCoordinatesChange, pickup, dropoff }) {
  const handleMapClick = (lat, lng) => {
    if (!pickup) {
      onCoordinatesChange({ lat, lng }, dropoff);
    } else if (!dropoff) {
      onCoordinatesChange(pickup, { lat, lng });
    } else {
      onCoordinatesChange({ lat, lng }, null);
    }
  };

  const defaultCenter = bounds ? 
    [(bounds.lat_min + bounds.lat_max) / 2, (bounds.lng_min + bounds.lng_max) / 2] : 
    [40.7128, -74.0060]; // NYC default

  return (
    <div className="w-full h-80 rounded-3xl overflow-hidden border border-white/60 shadow-inner relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {/* Premium Dark Map Tile Layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {bounds && <MapUpdater bounds={bounds} />}
        
        {/* Helper to fly to marker when it changes from search */}
        <MarkerFlyTo pickup={pickup} dropoff={dropoff} />
        <MapEvents onClick={handleMapClick} isActive={true} />
        
        {/* Fly to pickup when it changes and we don't have a dropoff yet, or just keep it in view */}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />}
        
        {pickup && dropoff && (
          <Polyline 
            positions={[[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]} 
            color="#3b82f6" 
            weight={4}
            opacity={0.6}
            dashArray="10, 10"
            className="animate-pulse"
          />
        )}
      </MapContainer>

      {/* Helper Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 shadow-sm border border-white/50">
        {!pickup ? 'Click to set Origin' : !dropoff ? 'Click to set Destination' : 'Click to reset route'}
      </div>
    </div>
  );
}
