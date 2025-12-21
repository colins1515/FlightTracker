import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
const [airport, setAirport] = useState('');
const router = useRouter();

function handleSearch() {
router.push(`/search?airport=${airport}`);
}

return (
<div>
<h1>Flight Tracker</h1>
<input
placeholder="Enter Airport Code (JFK)"
onChange={e => setAirport(e.target.value)}
/>
<button onClick={handleSearch}>Search Flights</button>
</div>
);
}