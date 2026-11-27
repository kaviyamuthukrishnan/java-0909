import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/authService';

export function ForgotPasswordPage() {
  const { pushToast } = useApp();
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'DONE'>('REQUEST');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authService.forgotPassword(email);
    pushToast({ type: 'info', title: 'Reset Requested', message: res.message });
    setStep('RESET');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      pushToast({ type: 'error', title: 'Password must be at least 8 characters.' });
      return;
    }
    const res = await authService.resetPassword(token, newPassword);
    pushToast({ type: 'success', title: 'Password Updated', message: res.message });
    setStep('DONE');
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-md px-4 sm:px-6 py-14">
        <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-[#14532D]">
            <KeyRound className="w-5 h-5" />
            <h1 className="font-display text-xl font-bold text-[#1C2520]">Password Recovery</h1>
          </div>

          {step === 'REQUEST' && (
            <form onSubmit={handleRequest} className="space-y-4">
              <p className="text-sm text-[#4A5950]">
                Enter your registered organization email to request a password reset token.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2.5 text-sm focus:border-[#14532D] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4022]"
              >
                Send Reset Request
              </button>
            </form>
          )}

          {step === 'RESET' && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-xs text-[#4A5950]">
                Enter the reset token printed in the Spring Boot console (or any 6+ char code in
                Demo Mode) and choose a new password.
              </p>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Reset token"
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
              />
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 pr-10 text-sm focus:border-[#14532D] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5950]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Reset Password
              </button>
            </form>
          )}

          {step === 'DONE' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-[#4A5950]">Your password reset flow is complete.</p>
              <Link
                to="/login"
                className="inline-block rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white"
              >
                Return to Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
