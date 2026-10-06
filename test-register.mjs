import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ashopwqkfxurdmjcntlm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzaG9wd3FrZnh1cmRtamNudGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMTk1NDMsImV4cCI6MjEwNTg5NTU0M30.3SGlzA8h23wEpUDYcqOZoa7QbO0wBE2DwSCU3T5vblw';

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
