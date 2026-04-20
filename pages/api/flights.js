const cache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  const { airport, flight_iata } = req.query;

  // Require at least one search parameter
  if (!airport && !flight_iata) {
    return res.status(400).json({ error: 'Missing airport or flight_iata parameter' });
  }

  const cacheKey = airport ? `airport-${airport}` : `flight-${flight_iata}`;

  // Serve from cache if still fresh
  if (cache[cacheKey] && Date.now() - cache[cacheKey].time < CACHE_TTL) {
    return res.status(200).json(cache[cacheKey].data);
  }

  // AviationStack free tier requires http, not https
  let url = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&limit=50`;

  if (airport) url += `&dep_iata=${airport}`;
  if (flight_iata) url += `&flight_iata=${flight_iata}`;

  try {
    const response = await fetch(url);

    // Surface non-200 responses from AviationStack
    if (!response.ok) {
      return res.status(502).json({ error: `AviationStack returned ${response.status}` });
    }

    const data = await response.json();

    // AviationStack returns error objects inside a 200 response
    if (data.error) {
      return res.status(502).json({ error: data.error.info || 'AviationStack API error' });
    }

    cache[cacheKey] = { data, time: Date.now() };

    return res.status(200).json(data);
  } catch (error) {
    // Log server-side for debugging, return message to client
    console.error('Flight fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
