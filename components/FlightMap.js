import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Link from 'next/link';

export default function AirportMap({ flights }) {
  // Only flights with valid coordinates
  const liveFlights = flights.filter(
    f =>
      f.live &&
      typeof f.live.latitude === 'number' &&
      typeof f.live.longitude === 'number'
  );

  // Fallback if no live coordinates exist
  if (liveFlights.length === 0) {
    return <p>No live flight position data available.</p>;
  }

  const center = [
    liveFlights[0].live.latitude,
    liveFlights[0].live.longitude
  ];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {liveFlights.map((flight, index) => (
        <Marker
          key={index}
          position={[
            flight.live.latitude,
            flight.live.longitude
          ]}
        >
          <Popup>
            <strong>{flight.flight.iata}</strong><br />
            {flight.airline.name}<br />
            <Link href={`/flight?flight_iata=${flight.flight.iata}`}>
              View Details
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
