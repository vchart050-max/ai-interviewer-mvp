const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
 
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
 
// Get candidate profile
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', req.params.id)
      .single();
 
    if (error) throw error;
 
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
// Create/Update candidate
router.post('/', async (req, res) => {
  try {
    const { userId, name, email, phone, idPhotoUrl } = req.body;
 
    const { data, error } = await supabase
      .from('candidates')
      .upsert([
        {
          user_id: userId,
          name,
          email,
          phone,
          id_photo_url: idPhotoUrl,
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: 'user_id' })
      .select()
      .single();
 
    if (error) throw error;
 
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
module.exports = router;