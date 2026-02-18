import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const email = process.argv[2];
const password = process.argv[3] || 'password123';
const name = process.argv[4] || 'Test User';

if (!email) {
  console.error('Usage: tsx scripts/create_verified_user.ts <email> [password] [name]');
  process.exit(1);
}

async function createVerifiedUser() {
  console.log(`Creating verified user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name }
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log('User created successfully:', data.user.id);

  // Create profile in public.users table
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      {
        id: data.user.id,
        username: email.split('@')[0],
        email: email,
        name: name,
        role: 'teknisi',
        password_hash: 'managed-by-supabase-auth',
      },
    ]);

  if (profileError) {
    console.error('Error creating user profile:', profileError.message);
  } else {
    console.log('User profile created in public.users table.');
  }
}

createVerifiedUser();
