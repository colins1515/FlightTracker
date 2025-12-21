import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamic import for Leaflet (SSR-safe)
const AirportMap = dynamic(() => import('../components/FlightMap'), {
  ssr: false
});

export default function Airports() {
  const [airport, setAirport] = useState('');
  const [flights, setFlights] = useState([]);

  async function loadFlights() {
    const res = await fetch(`/api/flights?airport=${airport}`);
    const data = await res.json();
    setFlights(data.data || []);
  }

  return (
    <div className="page">
      <h1>Airport Flight Map</h1>

      <div className="card">
        <input
          placeholder="Enter Airport Code (JFK)"
          onChange={e => setAirport(e.target.value)}
        />
        <button className="primary" onClick={loadFlights}>
          Load Flight Map
        </button>
      </div>

      {flights.length > 0 && (
        <AirportMap flights={flights} />
      )}
    </div>
  );
}
