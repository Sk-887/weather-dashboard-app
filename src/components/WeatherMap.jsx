import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    // 🔥 Keep current zoom level (don't reset to 10)
    map.flyTo(center, map.getZoom(), {
      duration: 1.5,
    });
  }, [center, map]);

  return null;
}

function WeatherMap({ lat, lon, city }) {
  const position = [lat, lon];

  return (
    <div style={{ height: "350px", marginTop: "30px" }}>
      <MapContainer
        center={position}
        zoom={10}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        style={{
          height: "100%",
          borderRadius: "20px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔥 Smooth fly without resetting zoom */}
        <ChangeView center={position} />

        <Marker position={position}>
          <Popup>
            📍 {city} <br />
            Lat: {lat.toFixed(3)} <br />
            Lon: {lon.toFixed(3)}
          </Popup>
        </Marker>

        <Circle
          center={position}
          radius={1500}
          pathOptions={{
            color: "#1e90ff",
            fillColor: "#1e90ff",
            fillOpacity: 0.2,
          }}
        />
      </MapContainer>
    </div>
  );
}

export default WeatherMap;
