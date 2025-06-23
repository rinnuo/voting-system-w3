import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "350px",
};

interface MarkerData {
  lat: number;
  lng: number;
  label?: string;
}

interface RecintoMapProps {
  markers: MarkerData[];
  isEditable?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerDrag?: (lat: number, lng: number) => void;
}

const RecintoMap: React.FC<RecintoMapProps> = ({
  markers,
  isEditable = false,
  onMapClick,
  onMarkerDrag,
}) => {
  const center = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: -17.783, lng: -63.18 };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onClick={isEditable && onMapClick
          ? (e) => {
              if (e.latLng) onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          : undefined
        }
      >
        {markers.map((m, i) => (
          <Marker
            key={i}
            position={{ lat: m.lat, lng: m.lng }}
            draggable={!!isEditable}
            onDragEnd={
              isEditable && onMarkerDrag
                ? (e) => {
                    if (e.latLng) onMarkerDrag(e.latLng.lat(), e.latLng.lng());
                  }
                : undefined
            }
            label={m.label}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default RecintoMap;