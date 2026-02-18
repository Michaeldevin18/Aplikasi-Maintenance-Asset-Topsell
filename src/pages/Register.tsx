import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getApiBaseUrl } from '@/lib/apiBase';
import { appFetch } from '@/lib/appFetch';
import { Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { TopsellLogo } from '@/components/Logo';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // 1. Attempt auto-verification registration via backend API
      const apiBaseUrl = getApiBaseUrl();
      const url = apiBaseUrl ? `${apiBaseUrl}/api/auth/register` : '/api/auth/register';

      const response = await appFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = (await response.text()).trim();
        if (text.toLowerCase().startsWith('<!doctype')) {
          throw new Error('Server API tidak terhubung. Silakan instal APK terbaru dan pastikan internet aktif.');
        }
        throw new Error('Server mengirim respons yang tidak valid.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // 2. If successful, log the user in directly
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // 3. Navigate to dashboard
      navigate('/dashboard');

    } catch (err: unknown) {
      let errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      
      // Handle rate limit error specifically
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        errorMessage = 'Too many attempts. Please wait a while before trying again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-brand-red mb-4">
             <TopsellLogo className="h-full w-full" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign In (Buat Akun)
          </h2>
          <p className="mt-1 text-sm font-medium text-brand-red uppercase tracking-wider">
            Join Topsell Asset Management
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Create your new account to get started
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

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-brand-red focus:border-brand-red focus:z-10 sm:text-sm transition-all"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-brand-red focus:border-brand-red focus:z-10 sm:text-sm transition-all"
                placeholder="Password (min 6 chars)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
             <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-brand-red focus:border-brand-red focus:z-10 sm:text-sm transition-all"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-red hover:text-red-700 flex items-center justify-center gap-1 mt-2">
              Login here <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
