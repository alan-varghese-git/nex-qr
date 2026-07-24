const { createClient } = require('@supabase/supabase-js');
try {
  createClient('https://placeholder.supabase.co', 'placeholder_anon_key');
  console.log('success');
} catch(e) {
  console.log('ERROR:', e.message);
}
