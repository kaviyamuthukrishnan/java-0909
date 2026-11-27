import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { Donation } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export function AdminMonitoringPage() {
  const {
    donations,
    allocations,
    ngos,
    runIntelligentAllocation,
    manualAllocateDonation,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [overrideTarget, setOverrideTarget] = useState<Donation | null>(null);
  const [selectedNgoId, setSelectedNgoId] = useState(ngos[0]?.id || '');
  const [manualQty, setManualQty] = useState(20);
  const [manualReason, setManualReason] = useState(
    'Admin priority reassignment to cover immediate shelter demand'
  );

  const verifiedNgos = ngos.filter((n) => n.verificationStatus === 'APPROVED');

  const filtered = donations.filter(
    (d) => statusFilter === 'ALL' || d.status === statusFilter
  );

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTarget) return;
    manualAllocateDonation(overrideTarget.id, selectedNgoId, manualQty, manualReason);
    setOverrideTarget(null);
  };

  return (
    <PortalLayout breadcrumb="Donation Monitoring & Allocation Control">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Donation Monitoring & Intelligent Allocation
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Audit multi-NGO splits, monitor collection deadlines, and apply manual allocation
              interventions when required.
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#D3DDD6] bg-white px-3 py-2 text-sm self-start"
          >
            <option value="ALL">All Donation States</option>
            <option value="PENDING_ALLOCATION">Pending Allocation</option>
            <option value="PARTIALLY_ALLOCATED">Partially Allocated</option>
            <option value="FULLY_ALLOCATED">Fully Allocated</option>
            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="EXPIRED">Expired / Unclaimed</option>
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map((d) => {
            const dAllocs = allocations.filter((a) => a.donationId === d.id);
            return (
              <div
                key={d.id}
                className="rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#14532D]">{d.id}</span>
                      <StatusBadge status={d.status} />
                      <span className="text-xs text-[#4A5950]">{d.providerName}</span>
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-[#1C2520]">{d.foodName}</h2>
                    <p className="text-xs text-[#4A5950] font-mono">
                      Confirmed: {d.confirmedQuantity} · Allocated: {d.allocatedQuantity} ·
                      Remaining: {d.remainingQuantity} · Deadline: {formatDateTime(d.safeUseDeadline)}
                    </p>
                  </div>

                  {d.remainingQuantity > 0 && d.status !== 'EXPIRED' && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => runIntelligentAllocation(d.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0F4022]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Run Intelligent Allocator
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOverrideTarget(d);
                          setSelectedNgoId(verifiedNgos[0]?.id || '');
                          setManualQty(d.remainingQuantity);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D3DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#1C2520] hover:bg-[#F2F6F3]"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Manual Assign
                      </button>
                    </div>
                  )}
                </div>

                {dAllocs.length > 0 && (
                  <div className="border-t border-[#E2E8E4] pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {dAllocs.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#1C2520] truncate">
                            {a.ngoName}
                          </span>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="font-mono text-xs font-bold text-[#14532D]">
                          {a.allocatedQuantity} meals · Score {a.matchScore}/100 ({a.assignedBy})
                        </p>
                        <p className="text-[11px] text-[#4A5950] leading-snug">
                          {a.selectionReasons.slice(0, 2).join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={Boolean(overrideTarget)}
        onClose={() => setOverrideTarget(null)}
        title="Manual Administrator Allocation"
        subtitle={overrideTarget ? `${overrideTarget.id} · Remaining ${overrideTarget.remainingQuantity} meals` : ''}
      >
        {overrideTarget && (
          <form onSubmit={handleManualAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Select Verified NGO
              </label>
              <select
                value={selectedNgoId}
                onChange={(e) => setSelectedNgoId(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white"
              >
                {verifiedNgos.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.ngoName} (Cap: {n.maxCollectionCapacity} meals)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Quantity to Allocate (Max {overrideTarget.remainingQuantity})
              </label>
              <input
                type="number"
                min={1}
                max={overrideTarget.remainingQuantity}
                required
                value={manualQty}
                onChange={(e) => setManualQty(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Intervention Reason *
              </label>
              <input
                type="text"
                required
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOverrideTarget(null)}
                className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white"
              >
                Assign Allocation
              </button>
            </div>
          </form>
        )}
      </Modal>
    </PortalLayout>
  );
}
