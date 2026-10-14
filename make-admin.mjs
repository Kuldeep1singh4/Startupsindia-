import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseKey) && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.trim().split('=');
    if (k === 'VITE_SUPABASE_URL') supabaseUrl = v.join('=');
    if (k === 'VITE_SUPABASE_ANON_KEY') supabaseKey = v.join('=');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin() {
  const { data: users, error: fetchError } = await supabase.from('ambassadors').select('*');
  console.log('Users found:', users?.length);
  
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  for (const user of users || []) {
    console.log(`Updating ${user.email}...`);
    const { data, error } = await supabase
      .from('ambassadors')
      .update({ role: 'admin', status: 'Approved' })
      .eq('id', user.id)
      .select();
      
    if (error) {
      console.error(`Error updating ${user.email}:`, error.message);
    } else {
      console.log(`Successfully made ${user.email} admin!`, data);
    }
  }
}

makeAdmin();
