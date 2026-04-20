import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { airportCoords } from '../lib/airportCoords';

// Fix broken marker icons in Next.js + Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function FlightMap({ flights, airport }) {
  const [dateFilter, setDateFilter] = useState('');
  const [arrFilter, setArrFilter] = useState('');

  const center = airportCoords[airport];

  if (!center) {
    return <div className="card"><p>Map not available for this airport.</p></div>;
  }

  // Build unique list of arrival airports for the filter dropdown
  const arrivalCodes = [...new Set(
    flights.map(f => f.arrival?.iata).filter(Boolean)
  )].sort();

  // Apply date and arrival airport filters
  const filtered = flights.filter(f => {
    const matchesDate = !dateFilter || f.departure?.scheduled?.startsWith(dateFilter);
    const matchesArr = !arrFilter || f.arrival?.iata === arrFilter;
    return matchesDate && matchesArr;
  });

  // Only render markers for flights with known arrival coordinates
  const mappable = filtered.filter(f => airportCoords[f.arrival?.iata]);

  return (
    <div>
      {/* Filter controls */}
      <div className="card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <div>
          <label>Date</label><br />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
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
        <div style={{ alignSelf: 'flex-end' }}>
          {/* Clear both filters */}
          <button onClick={() => { setDateFilter(''); setArrFilter(''); }}>
            Clear filters
          </button>
          <span style={{ marginLeft: '10px', fontSize: '13px' }}>
            {mappable.length} flight{mappable.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>

      <MapContainer center={center} zoom={4} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* One marker per arrival airport — clicking the popup link opens the flight page */}
        {mappable.map((f, idx) => (
          <Marker key={idx} position={airportCoords[f.arrival.iata]}>
            <Popup>
              <strong>{f.flight?.iata}</strong><br />
              {f.airline?.name}<br />
              {airport} → {f.arrival.iata}<br />
              Status: {f.flight_status}<br />
              <Link href={`/flight?flight_iata=${f.flight?.iata}`}>View flight →</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
