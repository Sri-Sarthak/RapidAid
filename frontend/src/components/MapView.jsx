import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";

// Build small, dependency-free circular emoji markers so we don't need
// to ship/configure Leaflet's default marker image assets.
const createIcon = (bg, emoji) =>
  L.divIcon({
    html: `<div style="background:${bg};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);font-size:15px;line-height:1;">${emoji}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });

export const MARKER_ICONS = {
  user: createIcon("#dc2626", "📍"),
  hospital: createIcon("#15846d", "🏥"),
  volunteer: createIcon("#2563eb", "🧑"),
  alert: createIcon("#dc2626", "🚨"),
};

// Recenters the map whenever the `center` prop changes
const RecenterOnChange = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng]);
  return null;
};

/**
 * markers: [{ lat, lng, type: 'user'|'hospital'|'volunteer'|'alert', popup?: ReactNode }]
 * circle: { lat, lng, radiusKm }
 */
const MapView = ({ center, zoom = 13, markers = [], circle, height = "260px", className = "" }) => {
  if (!center) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-ink-100 bg-ink-50 text-sm text-ink-400 ${className}`}
        style={{ height }}
      >
        Waiting for location...
      </div>
    );
  }

  return (
    <div className={`leaflet-map-container overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange center={center} />

        {circle && (
          <Circle
            center={[circle.lat, circle.lng]}
            radius={circle.radiusKm * 1000}
            pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.07, weight: 1.5 }}
          />
        )}

        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} icon={MARKER_ICONS[m.type] || MARKER_ICONS.user}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
