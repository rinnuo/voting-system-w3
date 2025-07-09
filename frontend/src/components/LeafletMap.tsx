import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polygon,
  useMapEvents,
} from "react-leaflet";
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

interface PolygonData {
  nombre: string;
  poligono: [number, number][];
}

interface LeafletMapProps {
  markers?: MarkerData[];
  isEditable?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerDrag?: (lat: number, lng: number) => void;
  className?: string;
  onMarkerClick?: (id: number | undefined) => void;
  polygons?: PolygonData[];
  drawPolygonMode?: boolean;
  polygonPoints?: [number, number][];
  onPolygonClick?: (index: number) => void;
  onDrawPoint?: (point: [number, number]) => void;
}

const ClickHandler: React.FC<{
  isEditable: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  drawPolygonMode?: boolean;
  onDrawPoint?: (point: [number, number]) => void;
}> = ({ isEditable, onMapClick, drawPolygonMode, onDrawPoint }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (drawPolygonMode && onDrawPoint) {
        onDrawPoint([lng, lat]);
      } else if (isEditable && onMapClick) {
        onMapClick(lat, lng);
      }
    },
  });
  return null;
};

function getCentroid(points: [number, number][]): [number, number] {
  const total = points.length;
  const sum = points.reduce(
    (acc, [lat, lng]) => {
      acc[0] += lat;
      acc[1] += lng;
      return acc;
    },
    [0, 0]
  );
  return [sum[0] / total, sum[1] / total];
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  markers = [],
  isEditable = false,
  onMapClick,
  onMarkerDrag,
  className = "",
  polygons = [],
  drawPolygonMode = false,
  polygonPoints = [],
  onDrawPoint,
}) => {
  const center = markers.length
    ? [markers[0].lat, markers[0].lng] as [number, number]
    : polygons.length
    ? [polygons[0].poligono[0][1], polygons[0].poligono[0][0]]
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

      <ClickHandler
        isEditable={isEditable}
        onMapClick={onMapClick}
        drawPolygonMode={drawPolygonMode}
        onDrawPoint={onDrawPoint}
      />

      {polygons.map((p, i) =>
        p.poligono?.length ? (
          <Polygon
            key={i}
            positions={p.poligono}
            pathOptions={{ color: "#22c55e", fillOpacity: 0.2 }}
          >
            <Tooltip
              direction="center"
              permanent
              position={getCentroid(p.poligono)}
            >
              {p.nombre}
            </Tooltip>
          </Polygon>
        ) : null
      )}


      {polygonPoints.length > 0 && (
        <Polygon
          positions={polygonPoints.map(([lng, lat]) => [lat, lng])}
          pathOptions={{ color: "#60a5fa", fillOpacity: 0.3, dashArray: "5, 10" }}
        />
      )}

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
