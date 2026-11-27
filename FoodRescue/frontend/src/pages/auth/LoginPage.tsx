import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useApp } from '../../contexts/AppContext';
import { UserRole } from '../../types';

export function LoginPage() {
  const { demoMode, loginWithCredentials, loginDemoRole, pushToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = (role: UserRole) => {
    if (role === 'PROVIDER') navigate('/provider/dashboard');
    else if (role === 'NGO') navigate('/ngo/dashboard');
    else navigate('/admin/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email address and a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithCredentials(email, password);
      pushToast({
        type: 'success',
        title: `Welcome back, ${user.name}`,
      });
      redirectByRole(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = (role: UserRole) => {
    const user = loginDemoRole(role);
    redirectByRole(user.role);
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Login Card */}
          <div className="lg:col-span-7 rounded-xl border border-[#E2E8E4] bg-white p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
                Account Sign In
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-[#1C2520]">
                Sign in to FoodRescue
              </h1>
              <p className="mt-1 text-sm text-[#4A5950]">
                Access your Food Provider, NGO, or Administrator portal.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3.5 py-2.5 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-[#1C2520]">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#14532D] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-[#D3DDD6] px-3.5 py-2.5 pr-10 text-sm focus:border-[#14532D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5950] hover:text-[#1C2520]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4022] disabled:opacity-60 transition-colors"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#E2E8E4] flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5950]">
              <span>
                Need an account?{' '}
                <Link to="/register/provider" className="font-semibold text-[#14532D] hover:underline">
                  Register Provider
                </Link>{' '}
                ·{' '}
                <Link to="/register/ngo" className="font-semibold text-[#EA580C] hover:underline">
                  Register NGO
                </Link>
              </span>
              <Link to="/verify-account" className="font-medium text-[#14532D] hover:underline">
                Verify Email / OTP
              </Link>
            </div>
          </div>

          {/* Right Panel: Demo Portal Switcher & Security Notice */}
          <div className="lg:col-span-5 space-y-5">
            {demoMode && (
              <div className="rounded-xl border border-orange-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EA580C]">DEMO MODE QUICK ACCESS</span>
                  <span className="text-[11px] font-mono text-[#4A5950]">No backend required</span>
                </div>
                <p className="text-xs text-[#4A5950] leading-relaxed">
                  Select a demonstration portal below to evaluate the multi-role workflow with
                  sample records:
                </p>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoAccess('PROVIDER')}
                    className="w-full rounded-lg border border-[#D3DDD6] bg-[#FAFBF9] px-4 py-3 text-left hover:border-[#14532D] hover:bg-[#F2F6F3] transition-colors"
                  >
                    <p className="text-sm font-semibold text-[#14532D]">
                      Sign in as Demo Food Provider
                    </p>
                    <p className="text-xs text-[#4A5950]">
                      Grand Horizon Hotel & Banquets · Arjun Menon
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoAccess('NGO')}
                    className="w-full rounded-lg border border-[#D3DDD6] bg-[#FAFBF9] px-4 py-3 text-left hover:border-[#EA580C] hover:bg-orange-50/40 transition-colors"
                  >
                    <p className="text-sm font-semibold text-[#EA580C]">Sign in as Demo NGO</p>
                    <p className="text-xs text-[#4A5950]">
                      HopeBridge Foundation · Meera Krishnan
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoAccess('ADMIN')}
                    className="w-full rounded-lg border border-[#D3DDD6] bg-[#FAFBF9] px-4 py-3 text-left hover:border-[#1C2520] hover:bg-[#F2F6F3] transition-colors"
                  >
                    <p className="text-sm font-semibold text-[#1C2520]">
                      Sign in as Demo Administrator
                    </p>
                    <p className="text-xs text-[#4A5950]">
                      FoodRescue Governance Desk · Priya Nair
                    </p>
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-2.5">
              <div className="flex items-center gap-2 text-[#14532D]">
                <ShieldCheck className="w-4 h-4" />
                <h2 className="text-sm font-semibold">Security & Role Isolation</h2>
              </div>
              <p className="text-xs text-[#4A5950] leading-relaxed">
                Administrator accounts cannot be publicly self-registered. When connected to the
                Java Spring Boot backend, JWT tokens are kept strictly in browser memory and every
                API route enforces Spring Security role checks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
