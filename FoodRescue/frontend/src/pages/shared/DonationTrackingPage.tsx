import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { formatDateTime } from '../../utils/formatters';

const STAGES = [
  'Surplus Prediction',
  'Provider Confirmation',
  'Donation Created',
  'NGO Allocation',
  'NGO Acceptance',
  'Pickup Scheduling',
  'Collection',
  'Distribution Confirmation',
  'Completed',
];

export function DonationTrackingPage() {
  const { currentUser, donations, allocations, pickups } = useApp();

  // Enforce role-based visibility
  const visibleDonations = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return donations;
    if (currentUser.role === 'PROVIDER') {
      return donations.filter((d) => d.providerId === (currentUser.organizationId || 'prov-1'));
    }
    // NGO sees donations allocated to them
    const myDonationIds = new Set(
      allocations
        .filter((a) => a.ngoId === (currentUser.organizationId || 'ngo-1'))
        .map((a) => a.donationId)
    );
    return donations.filter((d) => myDonationIds.has(d.id));
  }, [currentUser, donations, allocations]);

  const [selectedId, setSelectedId] = useState<string>(visibleDonations[0]?.id || '');
  const activeDonation =
    visibleDonations.find((d) => d.id === selectedId) || visibleDonations[0] || null;

  const activeAllocs = activeDonation
    ? allocations.filter((a) => {
        if (a.donationId !== activeDonation.id) return false;
        if (currentUser?.role === 'NGO') {
          return a.ngoId === (currentUser.organizationId || 'ngo-1');
        }
        return true;
      })
    : [];

  const activePickups = activeDonation
    ? pickups.filter((p) => {
        if (p.donationId !== activeDonation.id) return false;
        if (currentUser?.role === 'NGO') {
          return p.ngoId === (currentUser.organizationId || 'ngo-1');
        }
        return true;
      })
    : [];

  const getCompletedStageIndex = () => {
    if (!activeDonation) return 0;
    if (activeDonation.status === 'COMPLETED') return 8;
    if (activePickups.some((p) => p.status === 'DISTRIBUTED')) return 7;
    if (activePickups.some((p) => p.status === 'COLLECTED')) return 6;
    if (activePickups.length > 0 || activeDonation.status === 'PICKUP_SCHEDULED') return 5;
    if (activeAllocs.some((a) => a.status === 'ACCEPTED' || a.status === 'PICKUP_SCHEDULED'))
      return 4;
    if (activeAllocs.length > 0) return 3;
    return 2;
  };

  const stageIdx = getCompletedStageIndex();

  return (
    <PortalLayout breadcrumb="Donation Lifecycle Tracking">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              End-to-End Donation Tracking
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Monitor every stage from prediction through final NGO community distribution.
            </p>
          </div>
          {visibleDonations.length > 0 && (
            <select
              value={activeDonation?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-[#D3DDD6] bg-white px-3 py-2 text-sm font-mono"
            >
              {visibleDonations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} — {d.foodName.slice(0, 36)}
                </option>
              ))}
            </select>
          )}
        </div>

        {!activeDonation ? (
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-8 text-center text-sm text-[#4A5950]">
            No donations available under your current role permissions.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-[#14532D]">
                    {activeDonation.id} · {activeDonation.sourceType.replace(/_/g, ' ')}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-[#1C2520]">
                    {activeDonation.foodName}
                  </h2>
                  <p className="mt-1 text-xs text-[#4A5950]">
                    Provider: {activeDonation.providerName} · Confirmed:{' '}
                    {activeDonation.confirmedQuantity} meals · Created:{' '}
                    {formatDateTime(activeDonation.createdAt)}
                  </p>
                </div>
                <StatusBadge status={activeDonation.status} />
              </div>

              {/* 9-Stage Lifecycle Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-2">
                {STAGES.map((label, index) => {
                  const done = index <= stageIdx;
                  const skippedPred =
                    index === 0 && activeDonation.sourceType === 'VOLUNTARY';
                  return (
                    <div
                      key={label}
                      className={`rounded-lg border p-3 flex flex-col justify-between gap-2 ${
                        done
                          ? 'border-[#14532D] bg-[#F2F6F3]'
                          : 'border-[#E2E8E4] bg-[#FAFBF9]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-[#4A5950]">
                          0{index + 1}
                        </span>
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#94A3B8]" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#1C2520] leading-tight">
                        {skippedPred ? 'Voluntary Entry' : label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-3">
                <h3 className="font-display text-base font-semibold text-[#1C2520]">
                  Allocated NGO Recipients ({activeAllocs.length})
                </h3>
                {activeAllocs.length === 0 ? (
                  <p className="text-xs text-[#4A5950]">Awaiting NGO allocation.</p>
                ) : (
                  <div className="space-y-2.5">
                    {activeAllocs.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-3 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1C2520]">{a.ngoName}</p>
                          <p className="text-xs text-[#4A5950] font-mono">
                            {a.allocatedQuantity} meals · {a.distanceKm} km
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-3">
                <h3 className="font-display text-base font-semibold text-[#1C2520]">
                  Pickup & Distribution Records ({activePickups.length})
                </h3>
                {activePickups.length === 0 ? (
                  <p className="text-xs text-[#4A5950]">No pickups scheduled yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {activePickups.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#1C2520]">{p.ngoName}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <p className="text-xs text-[#4A5950] font-mono">
                          Scheduled: {formatDateTime(p.scheduledTime)}
                          {p.beneficiariesFed ? ` · Fed ${p.beneficiariesFed} beneficiaries` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
