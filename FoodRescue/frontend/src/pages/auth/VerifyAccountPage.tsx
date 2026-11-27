import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Copy, Mail, RefreshCw, ShieldAlert, Smartphone } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/authService';
import { formatDateTime } from '../../utils/formatters';

export function VerifyAccountPage() {
  const {
    pushToast,
    demoMode,
    demoPendingVerification,
    setDemoPendingRegistration,
    resendDemoRegistrationOtp,
  } = useApp();

  const [email, setEmail] = useState(demoPendingVerification?.email || '');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState(demoPendingVerification?.phone || '');
  const [demoOtp, setDemoOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demoPendingVerification?.email) setEmail(demoPendingVerification.email);
    if (demoPendingVerification?.phone) setPhone(demoPendingVerification.phone);
  }, [demoPendingVerification]);

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Enter your registered email address.');
      return;
    }

    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the six-digit email verification code.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail(email.trim(), code.trim());
      setVerified(true);
      pushToast({
        type: 'success',
        title: 'Email Verified Successfully',
        message: 'Your email has been verified. Your account may now await administrator approval.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setError('Enter your registered email address first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resendEmailOtp(email.trim());
      setCode('');
      pushToast({
        type: 'success',
        title: 'Verification Code Requested',
        message: 'Check the email delivery configured by your Spring Boot backend.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !/^\d{6}$/.test(demoOtp.trim())) {
      setError('Enter your registered phone number and six-digit Demo OTP.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyPhoneOtp(phone, demoOtp);
      if (!result.verified) {
        setError('Incorrect Demo OTP. Check the displayed code or request another one.');
        return;
      }

      setVerified(true);
      setDemoPendingRegistration(null);
      pushToast({
        type: 'success',
        title: 'Demo Registration Verified',
        message: 'Your demo account is ready for the demonstration.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendDemo = () => {
    const targetPhone = phone.trim() || demoPendingVerification?.phone || '';

    if (!targetPhone) {
      setError('Enter your phone number before generating a Demo OTP.');
      return;
    }

    setError(null);
    setDemoOtp('');
    resendDemoRegistrationOtp(targetPhone);
    pushToast({
      type: 'success',
      title: 'New Demo OTP Generated',
      message: 'Your new code is displayed in the Demo OTP panel.',
    });
  };

  const handleCopyOtp = async () => {
    const value = demoPendingVerification?.otp;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      pushToast({ type: 'success', title: 'Demo OTP Copied' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setDemoOtp(value);
      pushToast({ type: 'info', title: 'Demo OTP copied into the input field.' });
    }
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
            Registration Verification
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#1C2520]">
            Verify Your Account
          </h1>
          <p className="mt-2 text-sm text-[#4A5950]">
            {demoMode
              ? 'DEMO MODE: Verify your sample registration using the displayed Demo OTP.'
              : 'Enter the six-digit verification code generated by your Java Spring Boot backend.'}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {verified ? (
          <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="font-display text-xl font-bold text-[#1C2520]">
              Verification Successful!
            </h2>
            <p className="text-sm text-[#4A5950]">
              Your email verification is complete. Your account may still require administrator approval.
            </p>
            <Link
              to="/login"
              className="inline-flex rounded-lg bg-[#14532D] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Continue to Login
            </Link>
          </div>
        ) : demoMode ? (
          <div className="rounded-xl border border-orange-300 bg-orange-50/70 p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-orange-600" />
                <h2 className="font-display text-lg font-bold text-[#1C2520]">
                  Your Demo OTP
                </h2>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-orange-700">
                DEMO ONLY
              </span>
            </div>

            {demoPendingVerification?.otp ? (
              <div className="rounded-lg border border-orange-200 bg-white p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#4A5950]">Generated verification code</p>
                  <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-[#14532D]">
                    {demoPendingVerification.otp}
                  </p>
                  <p className="mt-2 text-xs text-[#4A5950]">
                    {demoPendingVerification.organizationName} · {demoPendingVerification.phone}
                  </p>
                  {demoPendingVerification.generatedAt && (
                    <p className="mt-1 text-xs text-[#4A5950]">
                      Generated {formatDateTime(demoPendingVerification.generatedAt)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#14532D] px-3 py-2 text-sm font-semibold text-[#14532D]"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy OTP'}
                </button>
              </div>
            ) : (
              <p className="rounded-lg bg-white p-4 text-sm text-[#4A5950]">
                No active Demo OTP. Enter your phone number and generate one below.
              </p>
            )}

            <form onSubmit={handleDemoVerification} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#1C2520]">
                  Registered Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Registered phone number"
                  className="w-full rounded-lg border border-[#D3DDD6] bg-white px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#1C2520]">
                  Six-Digit Demo OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={demoOtp}
                  onChange={(e) => setDemoOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter Demo OTP"
                  className="w-full rounded-lg border border-[#D3DDD6] bg-white px-3 py-2.5 font-mono text-sm tracking-widest"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-[#EA580C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify Demo OTP'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendDemo}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D3DDD6] bg-white px-4 py-2.5 text-sm font-semibold text-[#14532D]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Resend
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-[#14532D]">
              <Mail className="h-5 w-5" />
              <h2 className="font-semibold text-[#1C2520]">Email OTP Verification</h2>
            </div>

            <form onSubmit={handleEmailVerification} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#1C2520]">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#1C2520]">
                  Six-Digit Email Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter code from email or backend console"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2.5 font-mono text-sm tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleResendEmail}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#14532D] hover:underline disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                Resend Email OTP
              </button>
            </form>

            <p className="text-xs text-[#4A5950]">
              Phone OTP verification is not yet implemented in the current Java backend.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link to="/login" className="text-sm font-semibold text-[#14532D] hover:underline">
            Return to Login →
          </Link>
        </div>

        {!demoMode && (
          <div className="flex items-center gap-2 rounded-lg bg-[#F7FAF8] p-4 text-xs text-[#4A5950]">
            <Smartphone className="h-4 w-4 shrink-0" />
            This version verifies email through the existing Spring Boot API.
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
