import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/FlightMap'), { ssr: false });

export default function FlightDetails() {
  const { flight_iata } = useRouter().query;
  const [flight, setFlight] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!flight_iata) return;

    fetch(`/api/flights?flight_iata=${flight_iata}`)
      .then(res => res.json())
      .then(data => setFlight(data.data?.[0]));
  }, [flight_iata]);

  async function saveFavorite() {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flight_number: flight.flight.iata,
        airline: flight.airline.name
      })
    });

    if (res.ok) {
      setMessage('⭐ Saved to favorites!');
    } else {
      setMessage('❌ Failed to save');
    }
  }

  if (!flight) return <p className="loading">Loading flight details...</p>;

  return (
    <div className="page">
      <h1>Flight {flight.flight.iata}</h1>

      <div className="card">
        <p><strong>Status:</strong> {flight.flight_status}</p>
        <p><strong>Departure:</strong> {flight.departure.airport}</p>
        <p><strong>Arrival:</strong> {flight.arrival.airport}</p>

        <button className="primary" onClick={saveFavorite}>
          ⭐ Save to Favorites
        </button>

        {message && <p className="success">{message}</p>}
      </div>

      {flight.live && (
        <Map lat={flight.live.latitude} lng={flight.live.longitude} />
      )}
    </div>
  );
}