import React, { useState } from 'react';
import { FileUp, Save } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { FOOD_CATEGORY_LABELS, formatDateTime } from '../../utils/formatters';

export function NgoProfilePage() {
  const { currentUser, ngos, updateNgoProfile, addNgoDocument, pushToast } = useApp();
  const ngoId = currentUser?.organizationId || 'ngo-1';
  const ngo = ngos.find((n) => n.id === ngoId) || ngos[0];

  const [beneficiaryCount, setBeneficiaryCount] = useState(ngo.beneficiaryCount);
  const [dailyMealRequirement, setDailyMealRequirement] = useState(ngo.dailyMealRequirement);
  const [maxCollectionCapacity, setMaxCollectionCapacity] = useState(ngo.maxCollectionCapacity);
  const [transportType, setTransportType] = useState(ngo.transportType);
  const [volunteerCount, setVolunteerCount] = useState(ngo.volunteerCount);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNgoProfile(ngo.id, {
      beneficiaryCount,
      dailyMealRequirement,
      maxCollectionCapacity,
      transportType,
      volunteerCount,
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      pushToast({ type: 'error', title: 'Only PDF, JPG, or PNG files are allowed.' });
      return;
    }
    addNgoDocument(
      ngo.id,
      'NGO_REGISTRATION',
      file.name,
      Math.max(1, Math.round(file.size / 1024))
    );
  };

  return (
    <PortalLayout breadcrumb="NGO Profile & Verification">
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">{ngo.ngoName}</h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Reg #{ngo.registrationNumber} · Service Areas: {ngo.serviceLocations.join(', ')}
            </p>
          </div>
          <StatusBadge status={ngo.verificationStatus} />
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4"
        >
          <h2 className="font-display text-base font-semibold text-[#1C2520]">
            Capacity & Logistics Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Beneficiary Count
              </label>
              <input
                type="number"
                value={beneficiaryCount}
                onChange={(e) => setBeneficiaryCount(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Daily Meal Requirement
              </label>
              <input
                type="number"
                value={dailyMealRequirement}
                onChange={(e) => setDailyMealRequirement(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Max Pickup Capacity
              </label>
              <input
                type="number"
                value={maxCollectionCapacity}
                onChange={(e) => setMaxCollectionCapacity(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Transport Vehicle Details
              </label>
              <input
                type="text"
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Available Volunteers
              </label>
              <input
                type="number"
                value={volunteerCount}
                onChange={(e) => setVolunteerCount(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
          <p className="text-xs text-[#4A5950]">
            Accepted Food Categories:{' '}
            {ngo.acceptedCategories.map((c) => FOOD_CATEGORY_LABELS[c]).join(' · ')}
          </p>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white"
            >
              <Save className="w-4 h-4" />
              Save Capacity Settings
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#1C2520]">
              NGO Registration Documents
            </h2>
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-[#14532D] px-3.5 py-2 text-xs font-semibold text-[#14532D] cursor-pointer hover:bg-[#F2F6F3]">
              <FileUp className="w-4 h-4" />
              Upload Document
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUpload}
                className="sr-only"
              />
            </label>
          </div>
          <div className="divide-y divide-[#E2E8E4]">
            {ngo.documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between text-sm">
                <span className="font-medium text-[#1C2520]">{doc.fileName}</span>
                <span className="text-xs font-mono text-[#4A5950]">
                  {doc.fileSizeKb} KB · {formatDateTime(doc.uploadedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
