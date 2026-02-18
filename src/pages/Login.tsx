
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { TopsellLogo } from '@/components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Check if user exists in public.users
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.session.user.id)
          .single();

        if (!existingUser) {
          // Create user profile if not exists
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.session.user.id,
                username: email.split('@')[0],
                email: email,
                password_hash: 'managed-by-supabase-auth',
                role: 'teknisi', // Default role
                name: email.split('@')[0],
              },
            ]);

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // Don't block login if profile creation fails, but log it
          }
        }

        setSession(data.session);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      let errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (typeof errorMessage === 'string' && errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before logging in.';
      }
      setError(errorMessage || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 text-brand-red mb-4">
             <TopsellLogo className="h-full w-full" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
            TOPSELL
          </h2>
          <p className="mt-1 text-sm font-medium text-brand-red uppercase tracking-wider">
            Asset Management System
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Login to access your dashboard
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-brand-red p-4 mb-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-brand-red" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-brand-red focus:border-brand-red focus:z-10 sm:text-sm transition-all"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-brand-red focus:border-brand-red focus:z-10 sm:text-sm transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-brand-red hover:text-red-700 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-red hover:text-red-700">
              Sign In (Buat Akun)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
