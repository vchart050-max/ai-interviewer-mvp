router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, companyName } = req.body;
 
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
 
    if (authError) throw authError;
 
    // Create user record
    const { error: dbError } = await supabase.from('users').insert([
      {
        id: authData.user.id,
        email,
        role,
        company_name: role === 'hr' ? companyName : null,
        created_at: new Date().toISOString(),
      },
    ]);
 
    if (dbError) throw dbError;
 
    res.json({ 
      success: true, 
      user: authData.user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
 
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
 
    if (error) throw error;
 
    res.json({ 
      success: true, 
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
module.exports = router;