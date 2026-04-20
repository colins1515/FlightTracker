import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SearchResults() {
  const { airport } = useRouter().query;
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch flights whenever the airport query param changes
  useEffect(() => {
    if (!airport) return;
    setLoading(true);
    setError('');

    fetch(`/api/flights?airport=${airport}`)
      .then(res => res.json())
      .then(data => {
        if (!data.data || data.data.length === 0) {
          setError('No flights found for this airport.');
        } else {
          setFlights(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch flights.');
        setLoading(false);
      });
  }, [airport]);

  return (
    <div className="page">
      <h2>Flights departing {airport}</h2>

      {loading && <p className="loading">Loading flights…</p>}
      {error && <p className="error">{error}</p>}

      {/* Each result links to the full flight detail page */}
      {flights.map(f => (
        <div key={f.flight.iata} className="card">
          <p>
            <Link href={`/flight?flight_iata=${f.flight.iata}`}>
              <strong>{f.flight.iata}</strong>
            </Link>
            {' — '}{f.airline.name}
          </p>
          <p>
            {f.departure.iata} → {f.arrival.iata}
            {' · '}<span style={{ textTransform: 'capitalize' }}>{f.flight_status}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
