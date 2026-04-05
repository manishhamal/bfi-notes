import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('articles').select('content, title').limit(5);
  console.log(JSON.stringify(data, null, 2));
}

run();
