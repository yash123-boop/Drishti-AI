import React, { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapLocation {
  latitude: number;
  longitude: number;
}

interface TransitMapProps {
  currentLocation: MapLocation;
  destination?: MapLocation | null;
  routes?: Array<[number, number][]>;
  selectedRouteIndex?: number;
  followCurrentLocation?: boolean;
  currentLocationLabel?: string;
  markers?: Array<MapLocation & { label: string }>;
}

const routeColors = ['#7c3aed', '#0284c7', '#ea580c', '#db2777'];

const MapViewport: React.FC<TransitMapProps> = ({
  currentLocation,
  destination,
  routes = [],
  followCurrentLocation = false,
  markers = [],
}) => {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();

      if (followCurrentLocation && !destination && markers.length === 0) {
        map.setView([currentLocation.latitude, currentLocation.longitude], Math.max(map.getZoom(), 16));
        return;
      }

      const routePoints = routes.flatMap((route) => route.map(([longitude, latitude]) => [latitude, longitude] as LatLngExpression));
      const points = [
        [currentLocation.latitude, currentLocation.longitude] as LatLngExpression,
        ...(destination ? [[destination.latitude, destination.longitude] as LatLngExpression] : []),
        ...markers.map(({ latitude, longitude }) => [latitude, longitude] as LatLngExpression),
        ...routePoints,
      ];

      if (points.length > 1) {
        map.fitBounds(points as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 16 });
      } else {
        map.setView([currentLocation.latitude, currentLocation.longitude], 16);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentLocation, destination, followCurrentLocation, map, markers, routes]);

  return null;
};

export const TransitMap: React.FC<TransitMapProps> = ({
  currentLocation,
  destination = null,
  routes = [],
  selectedRouteIndex = 0,
  followCurrentLocation = false,
  currentLocationLabel = 'You are here',
  markers = [],
}) => (
  <div className="relative z-0 h-80 w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-600">
    <MapContainer
      center={[currentLocation.latitude, currentLocation.longitude]}
      zoom={16}
      scrollWheelZoom
      className="h-full w-full"
      aria-label="Interactive map showing your current location and routes"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        eventHandlers={{
          tileerror: (event) => {
            console.error('OpenStreetMap tile failed to load:', event);
          },
        }}
      />
      {routes.map((route, index) => (
        <Polyline
          key={`route-${index}`}
          positions={route.map(([longitude, latitude]): LatLngExpression => [latitude, longitude])}
          pathOptions={{
            color: routeColors[index % routeColors.length],
            weight: index === selectedRouteIndex ? 7 : 4,
            opacity: index === selectedRouteIndex ? 0.95 : 0.65,
          }}
        />
      ))}
      <CircleMarker
        center={[currentLocation.latitude, currentLocation.longitude]}
        radius={9}
        pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#059669', fillOpacity: 1 }}
      >
        <Tooltip permanent direction="top">{currentLocationLabel}</Tooltip>
      </CircleMarker>
      {markers.map((marker, index) => (
        <CircleMarker
          key={`${marker.latitude}-${marker.longitude}-${index}`}
          center={[marker.latitude, marker.longitude]}
          radius={7}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#0284c7', fillOpacity: 1 }}
        >
          <Tooltip direction="top">{marker.label}</Tooltip>
        </CircleMarker>
      ))}
      {destination && (
        <CircleMarker
          center={[destination.latitude, destination.longitude]}
          radius={9}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#dc2626', fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top">Destination</Tooltip>
        </CircleMarker>
      )}
      <MapViewport
        currentLocation={currentLocation}
        destination={destination}
        routes={routes}
        followCurrentLocation={followCurrentLocation}
      />
    </MapContainer>
  </div>
);
