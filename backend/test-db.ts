import { supabase } from './src/config/supabase';

async function check() {
  const { data } = await supabase.from('activity_events').select('*');
  console.log(data);
}
check();
