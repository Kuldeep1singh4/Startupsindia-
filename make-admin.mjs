import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ashopwqkfxurdmjcntlm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzaG9wd3FrZnh1cmRtamNudGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMTk1NDMsImV4cCI6MjEwNTg5NTU0M30.3SGlzA8h23wEpUDYcqOZoa7QbO0wBE2DwSCU3T5vblw';

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
