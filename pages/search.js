import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SearchResults() {
  const { airport } = useRouter().query;
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('');
  const [arrFilter, setArrFilter] = useState('');

  useEffect(() => {
    if (!airport) return;
    setLoading(true);
    setError('');
    setFlights([]);
    setStatusFilter('');
    setAirlineFilter('');
    setArrFilter('');

    fetch(`/api/flights?airport=${airport}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else if (!data.data || data.data.length === 0) {
          setError(`No flights found for ${airport}.`);
        } else {
          setFlights(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to reach the server. Please try again.');
        setLoading(false);
      });
  }, [airport]);

  // Build unique option lists from returned flights
  const statuses = useMemo(() => (
    [...new Set(flights.map(f => f.flight_status).filter(Boolean))].sort()
  ), [flights]);

  const airlines = useMemo(() => (
    [...new Set(flights.map(f => f.airline?.name).filter(Boolean))].sort()
  ), [flights]);

  const arrivalCodes = useMemo(() => (
    [...new Set(flights.map(f => f.arrival?.iata).filter(Boolean))].sort()
  ), [flights]);

  // Apply all active filters
  const filtered = useMemo(() => {
    return flights.filter(f => {
      if (statusFilter && f.flight_status !== statusFilter) return false;
      if (airlineFilter && f.airline?.name !== airlineFilter) return false;
      if (arrFilter && f.arrival?.iata !== arrFilter) return false;
      return true;
    });
  }, [flights, statusFilter, airlineFilter, arrFilter]);

  const hasFilters = statusFilter || airlineFilter || arrFilter;

  function clearFilters() {
    setStatusFilter('');
    setAirlineFilter('');
    setArrFilter('');
  }

  return (
    <div className="page">
      <h2>Flights departing {airport}</h2>

      {loading && <p className="loading">Loading flights…</p>}
      {error && <p className="error">{error}</p>}

      {/* Filters — only shown once flights are loaded */}
      {flights.length > 0 && (
        <div className="card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '8px' }}>
          <div>
            <label>Status</label><br />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {statuses.map(s => (
                <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Airline</label><br />
            <select value={airlineFilter} onChange={e => setAirlineFilter(e.target.value)}>
              <option value="">All</option>
              {airlines.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Arrival airport</label><br />
            <select value={arrFilter} onChange={e => setArrFilter(e.target.value)}>
              <option value="">All</option>
              {arrivalCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div>
            {hasFilters && (
              <button onClick={clearFilters}>Clear filters</button>
            )}
            <span style={{ marginLeft: hasFilters ? '10px' : '0', fontSize: '13px' }}>
              {filtered.length} of {flights.length} flight{flights.length !== 1 ? 's' : ''} shown
            </span>
          </div>
        </div>
      )}

      {filtered.map(f => (
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
