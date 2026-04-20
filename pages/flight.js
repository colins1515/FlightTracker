import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Map is loaded client-side only to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../components/FlightMap'), { ssr: false });

export default function FlightDetails() {
  const { flight_iata } = useRouter().query;
  const [flight, setFlight] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  // Checked on load so the save button is disabled for already-saved flights
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!flight_iata) return;

    // Fetch flight data from AviationStack via the flights API route
    fetch(`/api/flights?flight_iata=${flight_iata}`)
      .then(res => res.json())
      .then(data => {
        if (data.data?.[0]) {
          setFlight(data.data[0]);
        } else {
          setLoadError('Flight not found.');
        }
      })
      .catch(() => setLoadError('Failed to load flight data.'));

    // Check existing favorites to prevent duplicate saves
    fetch('/api/favorites')
      .then(res => res.json())
      .then(favs => {
        if (Array.isArray(favs) && favs.some(f => f.flight_number === flight_iata)) {
          setAlreadySaved(true);
        }
      })
      .catch(() => {});
  }, [flight_iata]);

  // POST flight to favorites; button is locked while request is pending
  async function saveFavorite() {
    if (alreadySaved || saving) return;
    setSaving(true);

    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flight_number: flight.flight.iata,
        airline: flight.airline.name
      })
    });

    if (res.ok) {
      setMessage('Saved to favorites!');
      setAlreadySaved(true);
    } else {
      setMessage('Failed to save.');
    }
    setSaving(false);
  }

  if (loadError) return <p className="error">{loadError}</p>;
  if (!flight) return <p className="loading">Loading flight details…</p>;

  return (
    <div className="page">
      <h1>Flight {flight.flight.iata}</h1>

      <div className="card">
        <p><strong>Airline:</strong> {flight.airline.name}</p>
        <p><strong>Status:</strong> {flight.flight_status}</p>
        <p><strong>Departure:</strong> {flight.departure.airport} ({flight.departure.iata})</p>
        <p><strong>Arrival:</strong> {flight.arrival.airport} ({flight.arrival.iata})</p>
        {flight.departure.scheduled && (
          <p><strong>Scheduled departure:</strong> {new Date(flight.departure.scheduled).toLocaleString()}</p>
        )}
        {/* Only shown when AviationStack reports a delay */}
        {flight.departure.delay && (
          <p><strong>Delay:</strong> {flight.departure.delay} min</p>
        )}

        <button
          className="primary"
          onClick={saveFavorite}
          disabled={alreadySaved || saving}
        >
          {alreadySaved ? '⭐ Already saved' : saving ? 'Saving…' : '⭐ Save to Favorites'}
        </button>

        {message && <p className="success">{message}</p>}
      </div>

      {/* Live map is only rendered when AviationStack returns position data */}
      {flight.live && (
        <Map lat={flight.live.latitude} lng={flight.live.longitude} />
      )}
    </div>
  );
}
