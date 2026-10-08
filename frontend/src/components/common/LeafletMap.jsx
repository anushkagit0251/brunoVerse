import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LeafletMap({ 
  center = [28.5355, 77.3910], 
  zoom = 13, 
  markers = [], 
  height = '180px',
  interactive = true 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent duplicate map initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Add center / user pin (blue pulsing circle marker)
      L.circleMarker(center, {
        radius: 8,
        fillColor: '#2563eb',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      // Add markers
      markers.forEach(m => {
        if (!m.lat || !m.lng) return;
        
        let color = '#2d6a4f'; // Default green
        if (m.urgency === 'CRITICAL' || m.urgency === 'HIGH' || m.type === 'EMERGENCY') {
          color = '#ef4444'; // Red
        } else if (m.type === 'SHELTER') {
          color = '#3b82f6'; // Blue
        } else if (m.type === 'VOLUNTEER') {
          color = '#f59e0b'; // Amber
        }

        const marker = L.circleMarker([m.lat, m.lng], {
          radius: 7,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(map);

        if (m.title) {
          const cleanPhone = (m.phone || '').replace(/[^0-9+]/g, '');
          const callBtnHtml = cleanPhone ? `<a href="tel:${cleanPhone}" style="display:inline-block;padding:4px 9px;background:#2d6a4f;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:700;font-size:11px;margin-right:6px;">📞 Call</a>` : '';
          const dirBtnHtml = m.directionsUrl ? `<a href="${m.directionsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:4px 9px;background:#e2e8f0;color:#1e293b;border-radius:6px;text-decoration:none;font-weight:700;font-size:11px;">📍 Directions</a>` : '';
          const popupContent = `
            <div style="font-family:inherit;font-size:12px;min-width:200px;padding:2px;">
              <strong style="font-size:13.5px;color:#1e293b;">${m.title}</strong>
              <div style="color:#64748b;margin:4px 0 8px 0;line-height:1.4;">${m.subtitle || m.address || ''}</div>
              <div style="display:flex;gap:6px;margin-top:6px;">
                ${callBtnHtml}
                ${dirBtnHtml}
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
        }
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet map error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers, interactive]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height, 
        borderRadius: '16px', 
        overflow: 'hidden',
        zIndex: 1,
        border: '1px solid rgba(0,0,0,0.06)'
      }} 
    />
  );
}
