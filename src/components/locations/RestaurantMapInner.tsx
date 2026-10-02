'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RestaurantLocation } from '@/data/locations';

interface RestaurantMapInnerProps {
  locations: RestaurantLocation[];
  activeLocation: RestaurantLocation;
  onSelectLocation: (location: RestaurantLocation) => void;
}

export default function RestaurantMapInner({
  locations,
  activeLocation,
  onSelectLocation,
}: RestaurantMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: activeLocation.coordinates,
      zoom: 12,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    // Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Clean up on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update or render markers whenever locations or activeLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    locations.forEach((loc) => {
      const isActive = loc.id === activeLocation.id;

      // Custom HTML Pin
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${
            isActive
              ? `
              <div class="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping"></div>
              <div class="absolute -inset-1 rounded-full bg-orange-500/40"></div>
              <div class="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/50 border-2 border-white transform transition-transform group-hover:scale-110">
                <span style="font-size: 18px;">🍔</span>
              </div>
            `
              : `
              <div class="relative w-8 h-8 rounded-xl bg-gray-900 text-orange-400 flex items-center justify-center border border-white/20 shadow-md hover:border-orange-500 hover:scale-110 transition-all">
                <span style="font-size: 14px;">📍</span>
              </div>
            `
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent border-0',
        iconSize: isActive ? [40, 40] : [32, 32],
        iconAnchor: isActive ? [20, 20] : [16, 16],
        popupAnchor: [0, -22],
      });

      const marker = L.marker(loc.coordinates, { icon: customIcon }).addTo(map);

      // Custom styled dark popup
      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; color: #fff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #fb923c; text-transform: uppercase; letter-spacing: 0.05em;">${loc.area}</span>
            <span style="font-size: 12px; background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 2px 8px; border-radius: 9999px; font-weight: 600;">Open</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #fff;">${loc.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; line-height: 1.4;">${loc.address}</p>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #f97316; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none;">Get Directions ↗</a>
            <a href="tel:${loc.phone}" style="padding: 6px 10px; background: rgba(255,255,255,0.1); color: #fff; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none;">📞 Call</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-dark-popup',
        closeButton: false,
      });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersRef.current[loc.id] = marker;

      if (isActive) {
        marker.openPopup();
      }
    });
  }, [locations, activeLocation.id, onSelectLocation]);

  // Smooth flyTo when activeLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo(activeLocation.coordinates, 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    const activeMarker = markersRef.current[activeLocation.id];
    if (activeMarker) {
      setTimeout(() => {
        activeMarker.openPopup();
      }, 600);
    }
  }, [activeLocation]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
      
      {/* Quick map overlay badge */}
      <div className="absolute top-4 left-4 z-[500] bg-gray-950/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-300 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>Dhaka Live Locations ({locations.length} Hubs)</span>
      </div>
    </div>
  );
}
