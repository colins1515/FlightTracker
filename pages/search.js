import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SearchResults() {
const { airport } = useRouter().query;
const [flights, setFlights] = useState([]);

useEffect(() => {
if (!airport) return;
fetch(`/api/flights?airport=${airport}`)
.then(res => res.json())
.then(data => setFlights(data.data || []));
}, [airport]);

return (
<div>
<h2>Flights departing {airport}</h2>
{flights.map(f => (
<p key={f.flight.iata}>
<Link href={`/flight?flight_iata=${f.flight.iata}`}>
  {f.flight.iata} – {f.airline.name}
</Link>
</p>
))}
</div>
);
}