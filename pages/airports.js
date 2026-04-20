import { useState } from 'react';
import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only
const AirportMap = dynamic(() => import('../components/FlightMap'), { ssr: false });

export default function Airports() {
  const [airport, setAirport] = useState('');
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadFlights() {
    setError('');
    setFlights([]);
    setLoading(true);

    const code = airport.trim().toUpperCase();

    if (code.length !== 3) {
      setError('Please enter a valid 3-letter IATA airport code (e.g., JFK).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/flights?airport=${code}`);
      const data = await res.json();

      // Show any error message returned from the API route
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (!data.data || data.data.length === 0) {
        setError('No flights found for this airport.');
      } else {
        setFlights(data.data);
      }
    } catch (err) {
      setError('Failed to reach the server. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="page">
      <h1>Airport Flight Map</h1>

      <div className="card">
        <input
          placeholder="Enter IATA Airport Code (JFK)"
          value={airport}
          onChange={e => setAirport(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadFlights()}
        />
        <button className="primary" onClick={loadFlights}>
          Load Flight Map
        </button>

        {loading && <p className="loading">Loading flights…</p>}
        {error && <p className="error">{error}</p>}
      </div>

      {/* Map only mounts once flights are loaded to avoid an empty Leaflet container */}
      {flights.length > 0 && (
        <AirportMap flights={flights} airport={airport.trim().toUpperCase()} />
      )}
    </div>
  );
}
