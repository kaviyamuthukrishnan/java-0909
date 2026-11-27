import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, MapPin, Search, XCircle } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { Donation, DonationAllocation, FoodCategory } from '../../types';
import {
  FOOD_CATEGORY_LABELS,
  formatDateTime,
  formatTimeRemaining,
} from '../../utils/formatters';

export function NgoAvailableDonationsPage() {
  const {
    currentUser,
    ngos,
    donations,
    allocations,
    acceptAllocation,
    declineAllocation,
    manualAllocateDonation,
    pushToast,
  } = useApp();

  const ngoId = currentUser?.organizationId || 'ngo-1';
  const ngo = ngos.find((n) => n.id === ngoId) || ngos[0];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [minQty, setMinQty] = useState<number>(0);

  // Accept Allocation Modal state
  const [activeAlloc, setActiveAlloc] = useState<DonationAllocation | null>(null);
  const [acceptQty, setAcceptQty] = useState(0);
  const [pickupTime, setPickupTime] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [transportMode, setTransportMode] = useState(ngo.transportType || 'Insulated Van');

  // Decline Modal state
  const [declineTarget, setDeclineTarget] = useState<DonationAllocation | null>(null);
  const [declineReason, setDeclineReason] = useState('Transport unavailable for this slot');

  // Direct Claim Modal for unallocated confirmed donations
  const [claimDonation, setClaimDonation] = useState<Donation | null>(null);
  const [claimQty, setClaimQty] = useState(25);

  // Strictly show only CONFIRMED non-expired donations (never unconfirmed predictions!)
  const confirmedAvailable = useMemo(() => {
    return donations.filter((d) => {
      const notExpired = new Date(d.safeUseDeadline).getTime() > Date.now();
      const hasQty = d.remainingQuantity > 0 && d.status !== 'CANCELLED' && d.status !== 'EXPIRED';
      const matchSearch =
        d.foodName.toLowerCase().includes(search.toLowerCase()) ||
        d.providerName.toLowerCase().includes(search.toLowerCase()) ||
        d.pickupAddress.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || d.category === categoryFilter;
      const matchMin = d.remainingQuantity >= minQty;
      return notExpired && hasQty && matchSearch && matchCat && matchMin;
    });
  }, [donations, search, categoryFilter, minQty]);

  const myRecommended = allocations.filter(
    (a) => a.ngoId === ngoId && (a.status === 'PENDING' || a.status === 'ACCEPTED')
  );

  const openAcceptModal = (alloc: DonationAllocation) => {
    setActiveAlloc(alloc);
    setAcceptQty(alloc.allocatedQuantity);
    setPickupTime(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
    setTransportMode(ngo.transportType || 'Insulated Van');
  };

  const handleConfirmAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlloc) return;
    acceptAllocation(
      activeAlloc.id,
      acceptQty,
      new Date(pickupTime).toISOString(),
      transportMode
    );
    setActiveAlloc(null);
  };

  const handleConfirmDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineTarget) return;
    declineAllocation(declineTarget.id, declineReason);
    setDeclineTarget(null);
  };

  const handleDirectClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimDonation) return;
    if (ngo.verificationStatus !== 'APPROVED') {
      pushToast({
        type: 'error',
        title: 'Verification Required',
        message: 'Only administrator-approved NGOs can claim donations.',
      });
      return;
    }
    const qty = Math.min(claimQty, claimDonation.remainingQuantity, ngo.maxCollectionCapacity);
    manualAllocateDonation(
      claimDonation.id,
      ngo.id,
      qty,
      'NGO requested partial/full collection from confirmed pool'
    );
    setClaimDonation(null);
  };

  return (
    <PortalLayout breadcrumb="Available Donations & Recommended Allocations">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C2520]">
            Available Food Donations
          </h1>
          <p className="mt-1 text-sm text-[#4A5950]">
            Only provider-confirmed, non-expired donations appear here. Predicted surplus is hidden
            until confirmed.
          </p>
        </div>

        {/* Recommended Allocations Assigned to This NGO */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#1C2520]">
              Recommended Allocations for {ngo.ngoName} ({myRecommended.length})
            </h2>
          </div>

          {myRecommended.length === 0 ? (
            <EmptyState
              title="No pending allocation requests"
              description="Check the open confirmed donations pool below or wait for the Intelligent Allocation engine to match new surplus."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRecommended.map((a) => {
                const rem = formatTimeRemaining(a.safeUseDeadline);
                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-[#4A5950]">
                          {a.donationId} · {a.id} · Match Score {a.matchScore}/100
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold text-[#1C2520]">
                          {a.foodName}
                        </h3>
                        <p className="text-xs text-[#4A5950]">{a.providerName}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#FAFBF9] border border-[#E2E8E4] p-3 text-xs">
                      <div>
                        <span className="text-[#4A5950] block">Allocated Qty</span>
                        <span className="font-mono font-bold text-[#14532D]">
                          {a.allocatedQuantity} meals
                        </span>
                      </div>
                      <div>
                        <span className="text-[#4A5950] block">Distance</span>
                        <span className="font-mono font-semibold text-[#1C2520]">
                          {a.distanceKm} km
                        </span>
                      </div>
                      <div>
                        <span className="text-[#4A5950] block">Deadline</span>
                        <span
                          className={`font-mono font-semibold ${
                            rem.isUrgent ? 'text-[#EA580C]' : 'text-[#1C2520]'
                          }`}
                        >
                          {rem.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#4A5950]">
                      <strong>Why Selected:</strong> {a.selectionReasons.join(' · ')}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E2E8E4]">
                      <button
                        type="button"
                        onClick={() => openAcceptModal(a)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0F4022]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept & Schedule Pickup
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeclineTarget(a)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Open Confirmed Pool with Filters */}
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#1C2520]">
            Open Confirmed Donations Pool ({confirmedAvailable.length})
          </h2>

          <div className="rounded-xl border border-[#E2E8E4] bg-white p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#4A5950] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search provider, food item, or location..."
                className="w-full rounded-lg border border-[#D3DDD6] pl-9 pr-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white"
            >
              <option value="ALL">All Categories</option>
              {(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((c) => (
                <option key={c} value={c}>
                  {FOOD_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={minQty || ''}
              onChange={(e) => setMinQty(Number(e.target.value) || 0)}
              placeholder="Min meals"
              className="w-32 rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
            />
          </div>

          {confirmedAvailable.length === 0 ? (
            <EmptyState
              title="No unallocated confirmed donations match your filters"
              description="All current confirmed batches are either allocated or filtered out. Adjust your filters or monitor recommended allocations above."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedAvailable.map((d) => {
                const rem = formatTimeRemaining(d.safeUseDeadline);
                return (
                  <div
                    key={d.id}
                    className="rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-[#4A5950]">
                          {d.id} · {FOOD_CATEGORY_LABELS[d.category]}
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold text-[#1C2520]">
                          {d.foodName}
                        </h3>
                        <p className="text-xs font-medium text-[#14532D]">{d.providerName}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>

                    <div className="text-xs text-[#4A5950] space-y-1">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{d.pickupAddress}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Prepared: {formatDateTime(d.preparationTime)} · Safe Deadline:{' '}
                          <strong className={rem.isUrgent ? 'text-[#EA580C]' : ''}>
                            {rem.label}
                          </strong>
                        </span>
                      </p>
                      <p>
                        <strong>Handling:</strong> {d.storageDetails}{' '}
                        {d.handlingInstructions ? `· ${d.handlingInstructions}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E8E4]">
                      <div>
                        <span className="text-xs text-[#4A5950]">Remaining Available: </span>
                        <span className="font-mono text-sm font-bold text-[#EA580C]">
                          {d.remainingQuantity} meals
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setClaimDonation(d);
                          setClaimQty(Math.min(d.remainingQuantity, ngo.dailyMealRequirement));
                        }}
                        className="rounded-lg bg-[#EA580C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C2410C]"
                      >
                        Request Collection
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Accept & Partial Quantity Modal */}
      <Modal
        isOpen={Boolean(activeAlloc)}
        onClose={() => setActiveAlloc(null)}
        title="Accept Allocation & Schedule Pickup"
        subtitle={activeAlloc?.foodName}
      >
        {activeAlloc && (
          <form onSubmit={handleConfirmAccept} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Quantity You Can Collect (max {activeAlloc.allocatedQuantity} meals)
              </label>
              <input
                type="number"
                min={1}
                max={activeAlloc.allocatedQuantity}
                required
                value={acceptQty}
                onChange={(e) => setAcceptQty(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
              <p className="mt-1 text-[11px] text-[#4A5950]">
                Accepting a partial quantity automatically returns remaining meals to the allocation
                pool for another NGO.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Proposed Pickup Time
              </label>
              <input
                type="datetime-local"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Transport Mode
              </label>
              <input
                type="text"
                required
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAlloc(null)}
                className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white"
              >
                Confirm Pickup
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Decline Modal */}
      <Modal
        isOpen={Boolean(declineTarget)}
        onClose={() => setDeclineTarget(null)}
        title="Decline Allocation"
        subtitle={declineTarget?.foodName}
      >
        <form onSubmit={handleConfirmDecline} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">
              Reason for Declining *
            </label>
            <textarea
              rows={3}
              required
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeclineTarget(null)}
              className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      </Modal>

      {/* Direct Request Collection Modal */}
      <Modal
        isOpen={Boolean(claimDonation)}
        onClose={() => setClaimDonation(null)}
        title="Request Food Collection"
        subtitle={claimDonation?.foodName}
      >
        {claimDonation && (
          <form onSubmit={handleDirectClaim} className="space-y-4">
            <p className="text-xs text-[#4A5950]">
              Available remaining: <strong>{claimDonation.remainingQuantity} meals</strong> · Your
              max collection capacity: <strong>{ngo.maxCollectionCapacity} meals</strong>.
            </p>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Quantity to Reserve (Meals)
              </label>
              <input
                type="number"
                min={1}
                max={Math.min(claimDonation.remainingQuantity, ngo.maxCollectionCapacity)}
                required
                value={claimQty}
                onChange={(e) => setClaimQty(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClaimDonation(null)}
                className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#EA580C] px-5 py-2 text-sm font-semibold text-white"
              >
                Reserve Allocation
              </button>
            </div>
          </form>
        )}
      </Modal>
    </PortalLayout>
  );
}
