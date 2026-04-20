const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  const { airport, flight_iata } = req.query;

  if (!airport && !flight_iata) {
    return res.status(400).json({ error: 'Missing airport or flight_iata parameter' });
  }

  const cacheKey = airport ? `airport-${airport}` : `flight-${flight_iata}`;

  // Serve from cache if still fresh
  if (cache[cacheKey] && Date.now() - cache[cacheKey].time < CACHE_TTL) {
    return res.status(200).json(cache[cacheKey].data);
  }

  let url = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&limit=100`;

  if (flight_iata) url += `&flight_iata=${flight_iata}`;
  if (airport) url += `&dep_iata=${airport.toUpperCase()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('AviationStack error:', JSON.stringify(data.error));
      return res.status(502).json({ error: data.error.info || 'AviationStack API error' });
    }

    if (!data.data) {
      return res.status(502).json({ error: 'Unexpected response from AviationStack' });
    }

    cache[cacheKey] = { data, time: Date.now() };
    return res.status(200).json(data);
  } catch (error) {
    console.error('Flight fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
