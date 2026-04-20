import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [airport, setAirport] = useState('');
  const router = useRouter();

  function handleSearch() {
    const code = airport.trim().toUpperCase();
    if (code.length !== 3) return;
    router.push(`/search?airport=${code}`);
  }

  return (
    <div className="page">
      <h1>Flight Tracker</h1>
      <div className="card">
        <input
          placeholder="Enter airport code (e.g. JFK)"
          value={airport}
          onChange={e => setAirport(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          maxLength={3}
        />
        <button className="primary" onClick={handleSearch}>
          Search Flights
        </button>
      </div>
    </div>
  );
}
