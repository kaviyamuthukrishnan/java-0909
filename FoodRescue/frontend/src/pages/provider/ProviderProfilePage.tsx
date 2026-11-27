import React, { useState } from 'react';
import { FileUp, Info, Save } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { FOOD_CATEGORY_LABELS, formatDateTime } from '../../utils/formatters';

export function ProviderProfilePage() {
  const { currentUser, providers, updateProviderProfile, addProviderDocument, pushToast } =
    useApp();

  const providerId = currentUser?.organizationId || 'prov-1';
  const provider = providers.find((p) => p.id === providerId) || providers[0];

  const [operatingHours, setOperatingHours] = useState(provider.operatingHours);
  const [dailyMealCapacity, setDailyMealCapacity] = useState(provider.dailyMealCapacity);
  const [phone, setPhone] = useState(provider.phone);
  const [address, setAddress] = useState(provider.address);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProviderProfile(provider.id, {
      operatingHours,
      dailyMealCapacity,
      phone,
      address,
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      pushToast({ type: 'error', title: 'Only PDF, JPG, or PNG files are allowed.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast({ type: 'error', title: 'Max file size is 5 MB.' });
      return;
    }
    addProviderDocument(provider.id, {
      providerId: provider.id,
      documentType: 'FSSAI_LICENSE',
      fileName: file.name,
      fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
      extractedFields: {
        licenseNumber: provider.fssaiNumber,
        organizationName: provider.organizationName,
        inconsistencies: [],
        disclaimer:
          'AI-assisted extraction only. Never independently certifies legal compliance; admin review required.',
      },
    });
  };

  return (
    <PortalLayout breadcrumb="Provider Profile & Verification">
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              {provider.organizationName}
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              {provider.organizationType} · FSSAI #{provider.fssaiNumber}
            </p>
          </div>
          <StatusBadge status={provider.verificationStatus} />
        </div>

        {provider.verificationNote && (
          <div className="rounded-xl border border-[#E2E8E4] bg-[#F7FAF8] p-4 flex items-start gap-2.5 text-xs text-[#1C2520]">
            <Info className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
            <span>
              <strong>Administrator Review Note:</strong> {provider.verificationNote}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4"
        >
          <h2 className="font-display text-base font-semibold text-[#1C2520]">
            Operational Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Daily Meal Capacity
              </label>
              <input
                type="number"
                value={dailyMealCapacity}
                onChange={(e) => setDailyMealCapacity(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-[#4A5950]">
            Registered Categories:{' '}
            {provider.foodCategories.map((c) => FOOD_CATEGORY_LABELS[c]).join(' · ')}
          </p>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F4022]"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-[#1C2520]">
                FSSAI & Verification Documents
              </h2>
              <p className="text-xs text-[#4A5950]">
                Only an administrator can approve your organization after document verification.
              </p>
            </div>
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-[#14532D] px-3.5 py-2 text-xs font-semibold text-[#14532D] cursor-pointer hover:bg-[#F2F6F3]">
              <FileUp className="w-4 h-4" />
              Upload New Document
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUpload}
                className="sr-only"
              />
            </label>
          </div>

          <div className="divide-y divide-[#E2E8E4]">
            {provider.documents.map((doc) => (
              <div key={doc.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1C2520]">{doc.fileName}</span>
                  <span className="text-xs font-mono text-[#4A5950]">
                    {doc.fileSizeKb} KB · {formatDateTime(doc.uploadedAt)}
                  </span>
                </div>
                {doc.extractedFields && (
                  <p className="text-xs text-[#4A5950]">
                    Extracted License: <span className="font-mono">{doc.extractedFields.licenseNumber}</span> ·{' '}
                    {doc.extractedFields.disclaimer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
