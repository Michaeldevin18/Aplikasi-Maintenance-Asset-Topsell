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

const args = process.argv.slice(2);
const email = args[0];
const password = args[1] || 'password123';
const name = args[2] || email?.split('@')[0] || 'User';

if (!email) {
  console.log('\n==================================================');
  console.log('AUTO VERIFY USER TOOL');
  console.log('==================================================');
  console.log('Usage: npm run create-user <email> [password] [name]');
  console.log('Example: npm run create-user test@example.com mypass123 "Test User"');
  console.log('--------------------------------------------------\n');
  process.exit(1);
}

async function manageUser() {
  console.log(`\nProcessing user: ${email}...`);

  let userId;

  // 1. Try to create the user
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name }
  });

  if (createError) {
    // If user exists, we need to find them and update them
    if (createError.message.includes('already registered') || createError.status === 422) {
      console.log('User already exists. Updating verification status and password...');
      
      // Find the user ID
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users to find ID:', listError.message);
        process.exit(1);
      }

      const existingUser = users.find(u => u.email === email);
      
      if (!existingUser) {
        console.error('Could not find user ID even though creation failed. Please check the email.');
        process.exit(1);
      }

      userId = existingUser.id;

      // Update the user to be confirmed and set the new password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          email_confirm: true, 
          password: password,
          user_metadata: { full_name: name } 
        }
      );

      if (updateError) {
        console.error('Error updating user:', updateError.message);
        process.exit(1);
      }
      console.log('User updated successfully!');
    } else {
      console.error('Error creating user:', createError.message);
      process.exit(1);
    }
  } else {
    console.log('User created and verified successfully!');
    userId = createData.user.id;
  }

  // 2. Ensure profile exists in public.users
  if (userId) {
    // Check if profile exists
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!profile) {
      console.log('Creating public profile...');
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            username: email.split('@')[0],
            email: email,
            name: name,
            role: 'teknisi',
            password_hash: 'managed-by-supabase-auth',
          },
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError.message);
      } else {
        console.log('Profile created in public.users.');
      }
    } else {
      console.log('Public profile already exists.');
    }
  }

  console.log('\n==================================================');
  console.log('SUCCESS! You can now login immediately.');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('==================================================\n');
}

manageUser();
