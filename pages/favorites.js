import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  // Live flight details fetched per favorite, keyed by flight number
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  // Tracks which row is currently being removed
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  // Load saved favorites from Supabase via API
  async function loadFavorites() {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load favorites.');
    }
    setLoading(false);
  }

  // For each favorite, fetch live flight details from AviationStack
  // Skips flights whose details have already been loaded
  useEffect(() => {
    favorites.forEach(fav => {
      if (details[fav.flight_number]) return;
      fetch(`/api/flights?flight_iata=${fav.flight_number}`)
        .then(res => res.json())
        .then(data => {
          if (data.data && data.data.length > 0) {
            setDetails(prev => ({
              ...prev,
              [fav.flight_number]: data.data[0]
            }));
          }
        })
        .catch(() => {});
    });
  }, [favorites]);

  // Send DELETE request and remove the entry from local state on success
  async function removeFavorite(id) {
    setRemovingId(id);
    const res = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (res.ok) {
      setFavorites(prev => prev.filter(f => f.id !== id));
      setRemovingId(null);
    } else {
      setError('Failed to remove favorite.');
      setRemovingId(null);
    }
  }

  if (loading) return <p className="loading">Loading saved flights…</p>;

  return (
    <div className="page">
      <h1>Saved Flights</h1>

      {error && <p className="error">{error}</p>}
      {favorites.length === 0 && !error && <p>No favorites saved yet.</p>}

      {favorites.map(fav => {
        const flight = details[fav.flight_number];

        return (
          <div key={fav.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>
                <Link href={`/flight?flight_iata=${fav.flight_number}`}>
                  Flight {fav.flight_number}
                </Link>
              </h3>
              {/* Remove button — disabled while the delete request is in flight */}
              <button
                onClick={() => removeFavorite(fav.id)}
                disabled={removingId === fav.id}
                className="remove-btn"
              >
                {removingId === fav.id ? 'Removing…' : '✕ Remove'}
              </button>
            </div>

            <p><strong>Airline:</strong> {fav.airline}</p>

            {/* Show live details once loaded, otherwise show a loading state */}
            {flight ? (
              <>
                <p><strong>Status:</strong> {flight.flight_status}</p>
                <p><strong>Departure:</strong> {flight.departure.airport}</p>
                <p><strong>Arrival:</strong> {flight.arrival.airport}</p>
                {flight.departure.scheduled && (
                  <p><strong>Scheduled:</strong> {new Date(flight.departure.scheduled).toLocaleString()}</p>
                )}
              </>
            ) : (
              <p className="loading">Loading live flight details…</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
