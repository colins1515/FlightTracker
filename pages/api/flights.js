const cache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  const { airport, flight_iata } = req.query;

  const cacheKey = airport
    ? `airport-${airport}`
    : `flight-${flight_iata}`;

  // Serve from cache
  if (cache[cacheKey] && Date.now() - cache[cacheKey].time < CACHE_TTL) {
    return res.status(200).json(cache[cacheKey].data);
  }

  let url = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}`;

  if (airport) url += `&dep_iata=${airport}`;
  if (flight_iata) url += `&flight_iata=${flight_iata}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    cache[cacheKey] = {
      data,
      time: Date.now()
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
