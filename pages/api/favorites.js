import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // Retrieve all saved favorites from Supabase, newest first
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  }

  // Save a new flight to the favorites table
  if (req.method === 'POST') {
    const { flight_number, airline } = req.body;

    const { data, error } = await supabase
      .from('favorites')
      .insert([{ flight_number, airline }]);

    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  }

  // Remove a favorite by its database row id
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing id' });

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json(error);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
