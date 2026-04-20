import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useMemo } from 'react';
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

  const center = airportCoords[airport];

  if (!center) {
    return <div className="card"><p>Map not available for this airport.</p></div>;
  }

  // Filter by date against scheduled or estimated departure
  const filtered = useMemo(() => {
    if (!dateFilter) return flights;
    return flights.filter(f => {
      const scheduled = f.departure?.scheduled || '';
      const estimated = f.departure?.estimated || '';
      return scheduled.startsWith(dateFilter) || estimated.startsWith(dateFilter);
    });
  }, [flights, dateFilter]);

  // Only show markers for flights with a known arrival coordinate
  const mappable = filtered.filter(f => airportCoords[f.arrival?.iata]);

  return (
    <div>
      <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '8px' }}>
        <div>
          <label>Date</label><br />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>
        <div>
          <button onClick={() => setDateFilter('')}>Clear</button>
          <span style={{ marginLeft: '10px', fontSize: '13px' }}>
            {mappable.length} of {flights.length} flight{flights.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>

      <MapContainer center={center} zoom={4} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mappable.map((f, idx) => (
          <Marker key={f.flight?.iata || idx} position={airportCoords[f.arrival.iata]}>
            <Popup>
              <strong>{f.flight?.iata}</strong><br />
              {f.airline?.name}<br />
              {airport} → {f.arrival.iata}<br />
              Status: {f.flight_status}<br />
              {f.departure?.scheduled && (
                <>Scheduled: {new Date(f.departure.scheduled).toLocaleString()}<br /></>
              )}
              <Link href={`/flight?flight_iata=${f.flight?.iata}`}>View flight →</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
