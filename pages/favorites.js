import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [details, setDetails] = useState({});

  // Load saved favorites from Supabase
  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(setFavorites);
  }, []);

  // For each favorite, fetch live flight details
  useEffect(() => {
    favorites.forEach(fav => {
      fetch(`/api/flights?flight_iata=${fav.flight_number}`)
        .then(res => res.json())
        .then(data => {
          if (data.data && data.data.length > 0) {
            setDetails(prev => ({
              ...prev,
              [fav.flight_number]: data.data[0]
            }));
          }
        });
    });
  }, [favorites]);

  return (
    <div className="page">
      <h1>Saved Flights</h1>

      {favorites.length === 0 && <p>No favorites saved yet.</p>}

      {favorites.map(fav => {
        const flight = details[fav.flight_number];

        return (
          <div key={fav.id} className="card">
            <h3>
              <Link href={`/flight?flight_iata=${fav.flight_number}`}>
                Flight {fav.flight_number}
              </Link>
            </h3>

            <p><strong>Airline:</strong> {fav.airline}</p>

            {flight ? (
              <>
                <p><strong>Status:</strong> {flight.flight_status}</p>
                <p><strong>Departure:</strong> {flight.departure.airport}</p>
                <p><strong>Arrival:</strong> {flight.arrival.airport}</p>
              </>
            ) : (
              <p>Loading live flight details…</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
