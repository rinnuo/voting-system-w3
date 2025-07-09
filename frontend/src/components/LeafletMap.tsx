import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface MarkerData {
  lat: number;
  lng: number;
  label?: string;
  id?: number;
}

interface LeafletMapProps {
  markers: MarkerData[];
  isEditable?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerDrag?: (lat: number, lng: number) => void;
  className?: string;
  onMarkerClick?: (id: number | undefined) => void;
}

const ClickHandler: React.FC<{
  isEditable: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}> = ({ isEditable, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (isEditable && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  markers,
  isEditable = false,
  onMapClick,
  onMarkerDrag,
  className = "",
}) => {
  const center = markers.length
    ? [markers[0].lat, markers[0].lng] as [number, number]
    : [-17.783, -63.18];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className={className}
      style={{ width: "100%", height: "350px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
      />
      <ClickHandler isEditable={isEditable} onMapClick={onMapClick} />
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={[m.lat, m.lng]}
          icon={markerIcon}
          draggable={!!isEditable}
          eventHandlers={
            isEditable && onMarkerDrag
              ? {
                  dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    onMarkerDrag(pos.lat, pos.lng);
                  },
                }
              : undefined
          }
        >
          {m.label && (
            <Tooltip direction="top" offset={[0, -30]} permanent>
              {m.label}
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;