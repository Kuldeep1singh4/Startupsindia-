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

async function testRegister() {
  console.log('Signing up...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  
  console.log('Auth success:', authData.user?.id);

  console.log('Inserting into ambassadors...');
  const { data, error: dbError } = await supabase.from('ambassadors').insert([{
    user_id: authData.user?.id,
    full_name: 'Test User',
    email: authData.user?.email,
    mobile_number: '1234567890',
    college_name: 'Test College',
    course: 'BTech',
    branch: 'CS',
    current_year: '1',
    city: 'Test City',
    district: 'Test District',
    state: 'Delhi',
    linkedin_url: null,
    instagram_url: null,
    youtube_url: null,
    motivation: 'test',
    areas_of_interest: 'test',
    status: 'Pending',
    referral_code: 'TESTCODE123',
    referred_by: null,
  }]);

  if (dbError) {
    console.error('DB Error:', dbError);
  } else {
    console.log('DB Success');
  }
}

testRegister();
