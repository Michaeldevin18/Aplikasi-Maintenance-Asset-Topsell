import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const apiBase = process.env.VITE_API_BASE_URL;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!apiBase || !supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_API_BASE_URL / VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in env');
  process.exit(1);
}

function randomEmail() {
  const rand = Math.random().toString(16).slice(2);
  return `smoke.${Date.now()}.${rand}@example.com`;
}

async function main() {
  const email = randomEmail();
  const password = 'password123';

  const registerRes = await fetch(`${apiBase}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Smoke Test' }),
  });
  const registerJson = await registerRes.json().catch(() => null);

  console.log('register.status', registerRes.status);
  console.log('register.body', registerJson);

  if (!registerRes.ok) {
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  console.log('login.ok', !!data.session);
  console.log('login.error', error?.message || null);

  if (!data.session || error) {
    process.exit(1);
  }
}

main();

