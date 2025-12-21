import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('favorites')
      .select('*');

    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { flight_number, airline } = req.body;

    const { data, error } = await supabase
      .from('favorites')
      .insert([{ flight_number, airline }]);

    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
