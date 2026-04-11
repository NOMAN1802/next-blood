
import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is loaded
import { bangladeshGeoJSON } from '@/lib/bangladeshGeoJSON';

// --- Icons Fix ---
// Leaflet default icons are broken in many bundlers, we fix them manually
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Custom Icon for Logistics
const logisticsIcon = L.divIcon({
  className: 'custom-logistics-icon',
  html: `<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">L</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// --- Helper Components ---

// Component to handle map movement/zoom programmatically
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 8);
    }
  }, [center, zoom, map]);
  return null;
};

// --- Main Map Component ---

const BangladeshMap = ({ data, districtStats, selectedDistrict, centers }) => {
  const [mapCenter, setMapCenter] = useState([23.6850, 90.3563]); // Center of Bangladesh
  const [mapZoom, setMapZoom] = useState(7);

  // Color Scale Logic
  const getColor = (count) => {
    return count >= 100 ? '#7f1d1d' :
           count >= 50  ? '#dc2626' :
           count >= 20  ? '#ea580c' :
           count >= 10  ? '#ca8a04' :
           count >= 1   ? '#facc15' :
                          '#9ca3af';
  };

  const style = (feature) => {
    const districtName = feature.properties.name;
    // Map data city names to stats keys (assuming case insensitivity)
    const stats = Object.entries(districtStats).find(([key]) => 
      key.toLowerCase() === districtName.toLowerCase()
    )?.[1] || { count: 0 };
    
    const isSelected = selectedDistrict && districtName.toLowerCase() === selectedDistrict.toLowerCase();

    return {
      fillColor: getColor(stats.count),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? 'white' : 'white',
      dashArray: '3',
      fillOpacity: isSelected ? 0.9 : 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const districtName = feature.properties.name;
    const stats = Object.entries(districtStats).find(([key]) => 
       key.toLowerCase() === districtName.toLowerCase()
    )?.[1] || { count: 0 };

    layer.bindTooltip(`
      <div class="font-bold">${districtName}</div>
      <div>Donors: ${stats.count}</div>
      <div class="text-xs text-gray-500">Available: ${stats.available}</div>
    `, { sticky: true, className: 'custom-tooltip' });
    
    // Optional: Add click handler if needed
    // layer.on('click', () => console.log(districtName));
  };

  // Effect to focus on selected district
  useEffect(() => {
    if (selectedDistrict) {
      // Very naive geocoding for demo - in real app use proper centroid data
      // Just shifting slightly for visual feedback if we don't have exact coordinates map
      // ideally GeoJSON features have centroids
      const feature = bangladeshGeoJSON.features.find(f => 
        f.properties.name.toLowerCase() === selectedDistrict.toLowerCase()
      );
      // If we had centroid logic, we'd set mapCenter here. 
      // For now, we just let the style highlight it.
    } else {
      setMapCenter([23.6850, 90.3563]);
      setMapZoom(7);
    }
  }, [selectedDistrict]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-neutral-800 relative z-0">
       <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%', background: '#171717' }}
          scrollWheelZoom={true}
       >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <GeoJSON 
            data={bangladeshGeoJSON} 
            style={style} 
            onEachFeature={onEachFeature}
          />

          {/* Logistics Centers Markers */}
          {centers.map(center => (
            <Marker 
              key={center.id} 
              position={[center.latitude, center.longitude]}
              icon={logisticsIcon}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-sm mb-1">{center.name}</h3>
                  <p className="text-xs">{center.location}</p>
                  <p className="text-xs text-blue-600 mt-1">{center.contact_info}</p>
                  <div className={`text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block ${center.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {center.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

       </MapContainer>

       {/* Legend Overlay */}
       <div className="absolute bottom-4 left-4 z-[400] bg-black/80 backdrop-blur p-3 rounded-lg border border-neutral-800">
          <div className="text-xs font-bold text-white mb-2">Donor Density</div>
          <div className="space-y-1">
             {[
               { color: '#7f1d1d', label: '100+ Donors' },
               { color: '#dc2626', label: '50-99 Donors' },
               { color: '#ea580c', label: '20-49 Donors' },
               { color: '#ca8a04', label: '10-19 Donors' },
               { color: '#facc15', label: '1-9 Donors' },
               { color: '#9ca3af', label: 'No Data' }
             ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                   <span className="text-[10px] text-neutral-300">{item.label}</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default BangladeshMap;
