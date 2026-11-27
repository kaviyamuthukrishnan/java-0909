import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, FileUp, Info } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/authService';
import { FoodCategory, ProviderOrgType } from '../../types';
import { FOOD_CATEGORY_LABELS } from '../../utils/formatters';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export function RegisterProviderPage() {
  const { pushToast, demoMode, setDemoPendingRegistration } = useApp();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState<ProviderOrgType>('HOTEL');
  const [managerName, setManagerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [operatingHours, setOperatingHours] = useState('07:00 AM – 11:00 PM');
  const [dailyMealCapacity, setDailyMealCapacity] = useState(250);
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [categories, setCategories] = useState<FoodCategory[]>(['COOKED_MEALS']);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docCheckSummary, setDocCheckSummary] = useState<string | null>(null);

  const toggleCategory = (cat: FoodCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      pushToast({
        type: 'error',
        title: 'Unsupported File Type',
        message: 'Upload PDF, JPG, or PNG documents only.',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Document must be 5 MB or smaller.',
      });
      return;
    }
    setDocFile(file);
    setDocCheckSummary(
      `Document "${file.name}" (${Math.round(file.size / 1024)} KB) staged. Preliminary check: ${
        fssaiNumber.length === 14
          ? '14-digit FSSAI format matches expected pattern.'
          : 'Enter 14-digit FSSAI license number for field consistency check.'
      } Note: Automated document checks do not certify legal compliance; an administrator will review manually.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categories.length === 0) {
      pushToast({ type: 'error', title: 'Select at least one food category.' });
      return;
    }
    if (password.length < 8) {
      pushToast({ type: 'error', title: 'Password must be at least 8 characters.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.registerProvider({
        organizationName,
        organizationType,
        managerName,
        email,
        phone,
        password,
        address,
        city,
        district,
        state: stateName,
        postalCode,
        operatingHours,
        foodCategories: categories,
        dailyMealCapacity,
        fssaiNumber,
      });
      if (demoMode && res.demoOtp) {
        setDemoPendingRegistration({
          organizationName,
          role: 'PROVIDER',
          email,
          phone,
          otp: res.demoOtp,
        });
        pushToast({
          type: 'success',
          title: 'Provider Registered (DEMO MODE)',
          message: 'A 6-digit Demo OTP has been generated on the verification screen.',
        });
        navigate('/verify-account');
        return;
      }

      setSubmittedNotice(
        res.devVerificationNotice ||
          'Registration submitted. Verify your email/phone OTP and await administrator approval.'
      );
      pushToast({
        type: 'success',
        title: 'Provider Registration Submitted',
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Registration Failed',
        message: err instanceof Error ? err.message : 'Please check your input.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
              Food Provider Onboarding
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-[#1C2520]">
              Register as a Food Provider
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              For hotels, restaurants, hostels, mess facilities, college canteens, and bakeries.
            </p>
          </div>
          <StatusBadge status={submittedNotice ? 'PENDING_REVIEW' : 'NOT_SUBMITTED'} />
        </div>

        {submittedNotice ? (
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-8 space-y-5">
            <div className="flex items-center gap-3 text-[#14532D]">
              <CheckCircle2 className="w-6 h-6" />
              <h2 className="font-display text-xl font-bold">
                Application Received — Pending Administrator Review
              </h2>
            </div>
            <p className="text-sm text-[#4A5950] leading-relaxed">{submittedNotice}</p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <strong>Development Verification Note:</strong> When connected to Spring Boot in local
              development, OTP codes are printed in the Java server console. Production email/SMS
              delivery is never simulated.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/verify-account"
                className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white"
              >
                Proceed to Email / OTP Verification
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm font-semibold text-[#1C2520]"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-[#E2E8E4] bg-white p-6 sm:p-8 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g., Grand Horizon Hotel"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Organization Type *
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value as ProviderOrgType)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white focus:border-[#14532D] focus:outline-none"
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="MESS">Mess Facility</option>
                  <option value="COLLEGE_CANTEEN">College Canteen</option>
                  <option value="BAKERY">Bakery</option>
                  <option value="CATERING">Catering Service</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Owner / Manager Name *
                </label>
                <input
                  type="text"
                  required
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 00000"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Password (min 8 chars) *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 pr-10 text-sm focus:border-[#14532D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5950]"
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Full Kitchen / Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Operating Hours *
                </label>
                <input
                  type="text"
                  required
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Approx. Daily Meal Capacity *
                </label>
                <input
                  type="number"
                  min={10}
                  required
                  value={dailyMealCapacity}
                  onChange={(e) => setDailyMealCapacity(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  FSSAI License Number *
                </label>
                <input
                  type="text"
                  required
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  placeholder="14-digit FSSAI number"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-2">
                Food Categories Prepared *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 rounded-lg border border-[#E2E8E4] px-3 py-2 text-xs cursor-pointer hover:bg-[#FAFBF9]"
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="accent-[#14532D]"
                    />
                    <span>{FOOD_CATEGORY_LABELS[cat]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Upload FSSAI License / Registration Document (PDF, JPG, PNG · max 5MB)
              </label>
              <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#D3DDD6] bg-[#FAFBF9] px-4 py-4 text-xs text-[#4A5950] cursor-pointer hover:border-[#14532D]">
                <FileUp className="w-4 h-4 text-[#14532D]" />
                <span>{docFile ? docFile.name : 'Choose supporting document to attach'}</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              {docCheckSummary && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#E2E8E4] bg-[#F7FAF8] p-3 text-xs text-[#4A5950]">
                  <Info className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
                  <span>{docCheckSummary}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E2E8E4]">
              <p className="text-xs text-[#4A5950]">
                Only an administrator can approve your provider account.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#14532D] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4022] disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Provider Registration'}
              </button>
            </div>
          </form>
        )}
      </section>
    </PublicLayout>
  );
}
