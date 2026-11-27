import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, FileUp } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/authService';
import { FoodCategory, NgoOrgType } from '../../types';
import { FOOD_CATEGORY_LABELS } from '../../utils/formatters';

export function RegisterNgoPage() {
  const { pushToast, demoMode, setDemoPendingRegistration } = useApp();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const [ngoName, setNgoName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [organizationType, setOrganizationType] = useState<NgoOrgType>('COMMUNITY_KITCHEN');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [serviceLocationsText, setServiceLocationsText] = useState('');
  const [beneficiaryCount, setBeneficiaryCount] = useState(100);
  const [dailyMealRequirement, setDailyMealRequirement] = useState(50);
  const [maxCollectionCapacity, setMaxCollectionCapacity] = useState(60);
  const [transportAvailable, setTransportAvailable] = useState(true);
  const [transportType, setTransportType] = useState('Insulated Van');
  const [volunteerCount, setVolunteerCount] = useState(6);
  const [operatingHours, setOperatingHours] = useState('08:00 AM – 10:30 PM');
  const [acceptedCategories, setAcceptedCategories] = useState<FoodCategory[]>([
    'COOKED_MEALS',
    'RICE_AND_CURRIES',
  ]);
  const [docFile, setDocFile] = useState<File | null>(null);

  const toggleCategory = (cat: FoodCategory) => {
    setAcceptedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (acceptedCategories.length === 0) {
      pushToast({ type: 'error', title: 'Select at least one accepted food category.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.registerNgo({
        ngoName,
        registrationNumber,
        organizationType,
        contactPerson,
        email,
        phone,
        password,
        address,
        city,
        serviceLocations: serviceLocationsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        beneficiaryCount,
        dailyMealRequirement,
        acceptedCategories,
        maxCollectionCapacity,
        transportAvailable,
        transportType,
        volunteerCount,
        operatingHours,
      });
      if (demoMode && res.demoOtp) {
        setDemoPendingRegistration({
          organizationName: ngoName,
          role: 'NGO',
          email,
          phone,
          otp: res.demoOtp,
        });
        pushToast({
          type: 'success',
          title: 'NGO Registered (DEMO MODE)',
          message: 'A 6-digit Demo OTP has been generated on the verification screen.',
        });
        navigate('/verify-account');
        return;
      }

      setSubmittedNotice(
        res.devVerificationNotice ||
          'NGO registration submitted. Pending administrator verification.'
      );
      pushToast({
        type: 'success',
        title: 'NGO Registration Submitted',
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Submission Failed',
        message: err instanceof Error ? err.message : 'Check fields and retry.',
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
            <p className="text-xs font-semibold uppercase tracking-wider text-[#EA580C]">
              NGO Partner Onboarding
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-[#1C2520]">
              Register as a Verified NGO
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Receive intelligent surplus meal allocations matched to your beneficiaries and transport.
            </p>
          </div>
          <StatusBadge status={submittedNotice ? 'PENDING_REVIEW' : 'NOT_SUBMITTED'} />
        </div>

        {submittedNotice ? (
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-8 space-y-5">
            <div className="flex items-center gap-3 text-[#14532D]">
              <CheckCircle2 className="w-6 h-6" />
              <h2 className="font-display text-xl font-bold">
                NGO Registration Submitted — Pending Review
              </h2>
            </div>
            <p className="text-sm text-[#4A5950]">{submittedNotice}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/verify-account"
                className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white"
              >
                Verify Email / Phone OTP
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm font-semibold text-[#1C2520]"
              >
                Go to Sign In
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
                <label className="block text-xs font-medium text-[#1C2520] mb-1">NGO Name *</label>
                <input
                  type="text"
                  required
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g., TN/SOC/2021/00412"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Organization Type *
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value as NgoOrgType)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white focus:border-[#14532D] focus:outline-none"
                >
                  <option value="COMMUNITY_KITCHEN">Community Kitchen</option>
                  <option value="SHELTER_HOME">Shelter Home</option>
                  <option value="CHILD_WELFARE">Child Welfare Home</option>
                  <option value="ELDER_CARE">Elder Care Center</option>
                  <option value="FOOD_BANK">Food Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Official Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Full Address *
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
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Service Locations (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={serviceLocationsText}
                  onChange={(e) => setServiceLocationsText(e.target.value)}
                  placeholder="Mylapore, Teynampet, Adyar"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Beneficiary Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={beneficiaryCount}
                  onChange={(e) => setBeneficiaryCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Daily Meal Need
                </label>
                <input
                  type="number"
                  min={1}
                  value={dailyMealRequirement}
                  onChange={(e) => setDailyMealRequirement(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Max Pickup Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxCollectionCapacity}
                  onChange={(e) => setMaxCollectionCapacity(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Volunteers Available
                </label>
                <input
                  type="number"
                  min={1}
                  value={volunteerCount}
                  onChange={(e) => setVolunteerCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <label className="flex items-center gap-2 text-xs font-medium text-[#1C2520]">
                <input
                  type="checkbox"
                  checked={transportAvailable}
                  onChange={(e) => setTransportAvailable(e.target.checked)}
                  className="accent-[#14532D]"
                />
                Dedicated Transport Available
              </label>
              <div>
                <input
                  type="text"
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  placeholder="Vehicle type"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Operating hours"
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-2">
                Food Categories Accepted *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 rounded-lg border border-[#E2E8E4] px-3 py-2 text-xs cursor-pointer hover:bg-[#FAFBF9]"
                  >
                    <input
                      type="checkbox"
                      checked={acceptedCategories.includes(cat)}
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
                Upload NGO Registration / Trust Deed (PDF, JPG, PNG)
              </label>
              <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#D3DDD6] bg-[#FAFBF9] px-4 py-4 text-xs text-[#4A5950] cursor-pointer hover:border-[#14532D]">
                <FileUp className="w-4 h-4 text-[#14532D]" />
                <span>{docFile ? docFile.name : 'Choose NGO registration document'}</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8E4]">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#EA580C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#C2410C] disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit NGO Registration'}
              </button>
            </div>
          </form>
        )}
      </section>
    </PublicLayout>
  );
}
