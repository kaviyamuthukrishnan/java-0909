import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { PickupRecord } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export function NgoCollectionsPage() {
  const {
    currentUser,
    pickups,
    confirmPickupCollection,
    reportPickupIssue,
    submitPickupFeedback,
  } = useApp();

  const ngoId = currentUser?.organizationId || 'ngo-1';
  const myPickups = pickups.filter((p) => p.ngoId === ngoId);

  const [collectTarget, setCollectTarget] = useState<PickupRecord | null>(null);
  const [collectedQty, setCollectedQty] = useState(0);
  const [beneficiariesFed, setBeneficiariesFed] = useState(0);

  const [issueTarget, setIssueTarget] = useState<PickupRecord | null>(null);
  const [issueType, setIssueType] = useState<'DELAYED' | 'ISSUE_REPORTED'>('DELAYED');
  const [issueDesc, setIssueDesc] = useState('');

  const [fbTarget, setFbTarget] = useState<PickupRecord | null>(null);
  const [rating, setRating] = useState(5);
  const [qualityNote, setQualityNote] = useState('Freshly packed and sealed at safe temperature.');
  const [punctualityNote, setPunctualityNote] = useState('Gate handoff completed smoothly.');

  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectTarget) return;
    confirmPickupCollection(collectTarget.id, collectedQty, beneficiariesFed);
    setCollectTarget(null);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTarget) return;
    reportPickupIssue(issueTarget.id, issueType, issueDesc);
    setIssueTarget(null);
    setIssueDesc('');
  };

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTarget) return;
    submitPickupFeedback(
      fbTarget.donationId,
      fbTarget.allocationId,
      rating,
      qualityNote,
      punctualityNote
    );
    setFbTarget(null);
  };

  return (
    <PortalLayout breadcrumb="NGO Pickup & Collection Management">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C2520]">
            Pickup & Collection Management
          </h1>
          <p className="mt-1 text-sm text-[#4A5950]">
            Confirm on-site collection, report transit delays, log distribution counts, and submit
            partner feedback.
          </p>
        </div>

        {myPickups.length === 0 ? (
          <EmptyState
            title="No pickups scheduled yet"
            description="Accept an allocation from Available Donations to schedule your first food collection."
          />
        ) : (
          <div className="rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8E4] bg-[#FAFBF9] text-xs font-semibold text-[#4A5950]">
                    <th className="px-4 py-3">Donation ID</th>
                    <th className="px-4 py-3">Provider & Food</th>
                    <th className="px-4 py-3 text-right">Assigned</th>
                    <th className="px-4 py-3">Scheduled Time</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E4] text-sm">
                  {myPickups.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAFBF9]">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#14532D]">
                        {p.donationId}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1C2520]">{p.providerName}</p>
                        <p className="text-xs text-[#4A5950]">
                          {p.foodName} · {p.pickupAddress}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">
                        {p.collectedQuantity ?? p.assignedQuantity} meals
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[#4A5950]">
                        {formatDateTime(p.scheduledTime)}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[#4A5950]">
                        {formatDateTime(p.deadline)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                        {p.status !== 'DISTRIBUTED' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setCollectTarget(p);
                                setCollectedQty(p.assignedQuantity);
                                setBeneficiariesFed(p.assignedQuantity);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-[#14532D] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0F4022]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm Collection
                            </button>
                            <button
                              type="button"
                              onClick={() => setIssueTarget(p)}
                              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Delay / Issue
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setFbTarget(p)}
                            className="inline-flex items-center gap-1 rounded-md border border-[#D3DDD6] px-2.5 py-1.5 text-xs font-medium text-[#1C2520] hover:bg-[#F2F6F3]"
                          >
                            <Star className="w-3.5 h-3.5 text-[#EA580C]" />
                            Feedback
                          </button>
                        )}
                        <Link
                          to="/portal/messages"
                          className="inline-flex items-center gap-1 rounded-md border border-[#D3DDD6] px-2.5 py-1.5 text-xs text-[#4A5950] hover:text-[#14532D]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Collection & Distribution */}
      <Modal
        isOpen={Boolean(collectTarget)}
        onClose={() => setCollectTarget(null)}
        title="Confirm Collection & Distribution"
        subtitle={collectTarget?.foodName}
      >
        {collectTarget && (
          <form onSubmit={handleConfirmCollection} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Actual Collected Quantity (Meals)
                </label>
                <input
                  type="number"
                  min={1}
                  max={collectTarget.assignedQuantity + 20}
                  required
                  value={collectedQty}
                  onChange={(e) => setCollectedQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2520] mb-1">
                  Beneficiaries Served
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={beneficiariesFed}
                  onChange={(e) => setBeneficiariesFed(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCollectTarget(null)}
                className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white"
              >
                Confirm Distribution
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delay / Issue Modal */}
      <Modal
        isOpen={Boolean(issueTarget)}
        onClose={() => setIssueTarget(null)}
        title="Report Pickup Delay or Issue"
      >
        <form onSubmit={handleReportIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">Report Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as 'DELAYED' | 'ISSUE_REPORTED')}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white"
            >
              <option value="DELAYED">Transit / Volunteer Delay</option>
              <option value="ISSUE_REPORTED">Packaging / Quantity Issue</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">Details *</label>
            <textarea
              rows={3}
              required
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              placeholder="Describe expected arrival delay or issue..."
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIssueTarget(null)}
              className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={Boolean(fbTarget)}
        onClose={() => setFbTarget(null)}
        title="Submit Collection Feedback"
      >
        <form onSubmit={handleFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">Rating (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-24 rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">
              Food Quality & Packaging Note
            </label>
            <input
              type="text"
              required
              value={qualityNote}
              onChange={(e) => setQualityNote(e.target.value)}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">
              Punctuality & Gate Coordination Note
            </label>
            <input
              type="text"
              required
              value={punctualityNote}
              onChange={(e) => setPunctualityNote(e.target.value)}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFbTarget(null)}
              className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white"
            >
              Save Feedback
            </button>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
