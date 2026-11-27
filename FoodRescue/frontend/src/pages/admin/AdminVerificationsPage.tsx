import React, { useState } from 'react';
import { CheckCircle2, FileText, ShieldAlert, XCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { VerificationStatus } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export function AdminVerificationsPage() {
  const { providers, ngos, verificationHistory, reviewVerification } = useApp();
  const [tab, setTab] = useState<'PROVIDERS' | 'NGOS' | 'HISTORY'>('PROVIDERS');

  const [reviewTarget, setReviewTarget] = useState<{
    type: 'PROVIDER' | 'NGO';
    id: string;
    name: string;
    detail: string;
    docNames: string[];
    aiNote?: string;
  } | null>(null);
  const [remarks, setRemarks] = useState('');

  const handleDecision = (status: VerificationStatus) => {
    if (!reviewTarget) return;
    reviewVerification(
      reviewTarget.type,
      reviewTarget.id,
      status,
      remarks.trim() || `Status updated to ${status.replace(/_/g, ' ')}`
    );
    setReviewTarget(null);
    setRemarks('');
  };

  return (
    <PortalLayout breadcrumb="Organization Verifications">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Provider & NGO Verification Center
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Inspect FSSAI licenses, NGO registrations, and maintain verification audit history.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-[#F2F6F3] p-1 self-start">
            {(['PROVIDERS', 'NGOS', 'HISTORY'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === t ? 'bg-white text-[#14532D] shadow-sm' : 'text-[#4A5950]'
                }`}
              >
                {t === 'PROVIDERS'
                  ? `Providers (${providers.length})`
                  : t === 'NGOS'
                  ? `NGOs (${ngos.length})`
                  : `History (${verificationHistory.length})`}
              </button>
            ))}
          </div>
        </div>

        {tab === 'PROVIDERS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-[#1C2520]">
                      {p.organizationName}
                    </h2>
                    <p className="text-xs text-[#4A5950]">
                      {p.organizationType} · Manager: {p.managerName}
                    </p>
                  </div>
                  <StatusBadge status={p.verificationStatus} />
                </div>
                <div className="text-xs text-[#4A5950] space-y-1">
                  <p>
                    <strong>FSSAI:</strong> <span className="font-mono">{p.fssaiNumber}</span> ·
                    Capacity: {p.dailyMealCapacity} meals/day
                  </p>
                  <p>
                    <strong>Location:</strong> {p.address}, {p.city}
                  </p>
                  <p>
                    <strong>Documents:</strong>{' '}
                    {p.documents.map((d) => d.fileName).join(', ') || 'None'}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E2E8E4] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setRemarks('');
                      setReviewTarget({
                        type: 'PROVIDER',
                        id: p.id,
                        name: p.organizationName,
                        detail: `FSSAI #${p.fssaiNumber} · ${p.address}, ${p.city}`,
                        docNames: p.documents.map((d) => d.fileName),
                        aiNote: p.documents[0]?.extractedFields?.inconsistencies.join('; '),
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0F4022]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Inspect & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'NGOS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ngos.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-[#1C2520]">{n.ngoName}</h2>
                    <p className="text-xs text-[#4A5950]">
                      Reg #{n.registrationNumber} · Contact: {n.contactPerson}
                    </p>
                  </div>
                  <StatusBadge status={n.verificationStatus} />
                </div>
                <div className="text-xs text-[#4A5950] space-y-1">
                  <p>
                    <strong>Beneficiaries:</strong> {n.beneficiaryCount} ·{' '}
                    <strong>Max Pickup:</strong> {n.maxCollectionCapacity} meals
                  </p>
                  <p>
                    <strong>Service Areas:</strong> {n.serviceLocations.join(', ')}
                  </p>
                  <p>
                    <strong>Documents:</strong>{' '}
                    {n.documents.map((d) => d.fileName).join(', ') || 'None'}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E2E8E4] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setRemarks('');
                      setReviewTarget({
                        type: 'NGO',
                        id: n.id,
                        name: n.ngoName,
                        detail: `Reg #${n.registrationNumber} · ${n.address}, ${n.city}`,
                        docNames: n.documents.map((d) => d.fileName),
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0F4022]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Inspect & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'HISTORY' && (
          <div className="rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8E4] bg-[#FAFBF9] text-xs font-semibold text-[#4A5950]">
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Decision</th>
                    <th className="px-4 py-3">Reviewed By</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E4] text-sm">
                  {verificationHistory.map((v) => (
                    <tr key={v.id}>
                      <td className="px-4 py-3 font-medium text-[#1C2520]">{v.targetName}</td>
                      <td className="px-4 py-3 text-xs font-mono text-[#4A5950]">{v.targetType}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={v.newStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[#4A5950]">{v.reviewedByAdminName}</td>
                      <td className="px-4 py-3 text-xs text-[#4A5950]">{v.remarks}</td>
                      <td className="px-4 py-3 text-xs font-mono text-[#4A5950]">
                        {formatDateTime(v.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        title={`Review ${reviewTarget?.name || ''}`}
        subtitle={reviewTarget?.detail}
      >
        {reviewTarget && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-3.5 text-xs space-y-1.5">
              <p className="font-semibold text-[#1C2520]">Attached Documents</p>
              <p className="font-mono text-[#4A5950]">
                {reviewTarget.docNames.join(', ') || 'No files uploaded'}
              </p>
              {reviewTarget.aiNote && (
                <p className="text-amber-800">
                  <strong>Document Check Flag:</strong> {reviewTarget.aiNote}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Verification Remarks / Reason
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter approval note, correction request, or rejection reason..."
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E2E8E4]">
              <button
                type="button"
                onClick={() => handleDecision('APPROVED')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-3.5 py-2 text-xs font-semibold text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleDecision('CORRECTION_REQUIRED')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-3.5 py-2 text-xs font-semibold text-white"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Request Correction
              </button>
              <button
                type="button"
                onClick={() => handleDecision('REJECTED')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3.5 py-2 text-xs font-semibold text-white"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PortalLayout>
  );
}
