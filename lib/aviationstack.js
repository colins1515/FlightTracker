export async function fetchFlightsByAirport(airport) {
  const res = await fetch(
    `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&dep_iata=${airport}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch flight data');
  }

  return res.json();
}
