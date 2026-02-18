import { Router, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

router.get('/status', async (_req: Request, res: Response): Promise<void> => {
  const configured = !!getSupabaseAdmin();
  res.status(200).json({ ok: true, configured });
});

/**
 * User Registration (Auto-Verified)
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      res.status(500).json({
        error: 'Server is not configured for auto-verified registration',
      });
      return;
    }

    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // 1. Create user with email_confirm: true (Bypasses email verification)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name || email.split('@')[0] }
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already registered')) {
        res.status(409).json({ error: 'Email already registered. Please login.' });
        return;
      }

      res.status(400).json({ error: authError.message || 'Registration failed' });
      return;
    }

    if (!authData.user) {
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    const userId = authData.user.id;

    // 2. Create user profile in public.users table
    // We use the admin client here too to ensure we bypass RLS if needed, 
    // though usually public.users should be writable by authenticated users.
    // But since we are doing this server-side, might as well use admin for reliability.
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: userId,
          username: email.split('@')[0],
          email: email,
          name: name || email.split('@')[0],
          role: 'teknisi', // Default role
          password_hash: 'managed-by-supabase-auth', // Placeholder
        },
      ]);

    if (profileError) {
      res.status(200).json({
        success: true,
        message: 'User registered and verified successfully',
        warning: 'User profile was not created',
        user: {
          id: userId,
          email: email,
          name: name,
        },
      });
      return;
    }

    // 3. Return success
    res.status(200).json({ 
      success: true, 
      message: 'User registered and verified successfully',
      user: {
        id: userId,
        email: email,
        name: name
      }
    });

  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  // We can just rely on client-side Supabase login, 
  // or implement server-side login if needed. 
  // For this task, we only needed to fix registration.
  res.status(501).json({ message: 'Not implemented' });
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;
