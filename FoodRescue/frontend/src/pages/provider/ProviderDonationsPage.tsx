import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageSquare, Search, Sparkles } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { Donation } from '../../types';
import { FOOD_CATEGORY_LABELS, formatDateTime } from '../../utils/formatters';

export function ProviderDonationsPage() {
  const { currentUser, donations, allocations, runIntelligentAllocation } = useApp();
  const providerId = currentUser?.organizationId || 'prov-1';

  const myDonations = donations.filter((d) => d.providerId === providerId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Donation | null>(null);

  const filtered = useMemo(() => {
    return myDonations.filter((d) => {
      const matchSearch =
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.foodName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [myDonations, search, statusFilter]);

  const selectedAllocs = selected
    ? allocations.filter((a) => a.donationId === selected.id)
    : [];

  return (
    <PortalLayout breadcrumb="Provider Donation Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Donation History & Allocations
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Track confirmed donations, remaining unallocated meals, assigned NGOs, and pickup
              status.
            </p>
          </div>
          <Link
            to="/provider/donate"
            className="inline-flex items-center rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C2410C] whitespace-nowrap shrink-0"
          >
            + New Voluntary Donation
          </Link>
        </div>

        <div className="rounded-xl border border-[#E2E8E4] bg-white p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4A5950] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Donation ID or food name..."
              className="w-full rounded-lg border border-[#D3DDD6] pl-9 pr-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_ALLOCATION">Pending Allocation</option>
            <option value="PARTIALLY_ALLOCATED">Partially Allocated</option>
            <option value="FULLY_ALLOCATED">Fully Allocated</option>
            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No donations found"
            description="Confirm a predicted surplus or create a voluntary donation to begin matching NGOs."
          />
        ) : (
          <div className="rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8E4] bg-[#FAFBF9] text-xs font-semibold text-[#4A5950]">
                    <th className="px-4 py-3">Donation ID</th>
                    <th className="px-4 py-3">Food Item</th>
                    <th className="px-4 py-3 text-right">Confirmed</th>
                    <th className="px-4 py-3 text-right">Allocated</th>
                    <th className="px-4 py-3 text-right">Remaining</th>
                    <th className="px-4 py-3">Assigned NGOs</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E4] text-sm">
                  {filtered.map((d) => {
                    const assigned = allocations.filter(
                      (a) => a.donationId === d.id && a.status !== 'REJECTED'
                    );
                    return (
                      <tr key={d.id} className="hover:bg-[#FAFBF9]">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#14532D]">
                          {d.id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1C2520]">{d.foodName}</p>
                          <p className="text-xs text-[#4A5950]">
                            {FOOD_CATEGORY_LABELS[d.category]} · {formatDateTime(d.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          {d.confirmedQuantity}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-[#14532D] font-semibold">
                          {d.allocatedQuantity}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-[#EA580C]">
                          {d.remainingQuantity}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#4A5950]">
                          {assigned.length === 0
                            ? 'Unassigned'
                            : assigned.map((a) => `${a.ngoName} (${a.allocatedQuantity})`).join(', ')}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                          {d.remainingQuantity > 0 && d.status !== 'EXPIRED' && (
                            <button
                              type="button"
                              onClick={() => runIntelligentAllocation(d.id)}
                              title="Run Intelligent NGO Allocation"
                              className="inline-flex items-center gap-1 rounded-md bg-[#14532D] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#0F4022]"
                            >
                              <Sparkles className="w-3 h-3" />
                              Allocate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelected(d)}
                            className="inline-flex items-center gap-1 rounded-md border border-[#D3DDD6] px-2.5 py-1 text-xs font-medium text-[#1C2520] hover:bg-[#F2F6F3]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Donation ${selected.id}` : ''}
        subtitle={selected?.foodName}
        maxWidth="max-w-2xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-4">
              <div>
                <p className="text-xs text-[#4A5950]">Confirmed</p>
                <p className="font-mono text-lg font-bold">{selected.confirmedQuantity}</p>
              </div>
              <div>
                <p className="text-xs text-[#4A5950]">Allocated</p>
                <p className="font-mono text-lg font-bold text-[#14532D]">
                  {selected.allocatedQuantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4A5950]">Remaining</p>
                <p className="font-mono text-lg font-bold text-[#EA580C]">
                  {selected.remainingQuantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4A5950]">Safe-Use Deadline</p>
                <p className="font-mono text-xs font-semibold">
                  {formatDateTime(selected.safeUseDeadline)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1C2520] mb-2">
                NGO Allocation Breakdown ({selectedAllocs.length})
              </h3>
              {selectedAllocs.length === 0 ? (
                <p className="text-xs text-[#4A5950]">
                  Not allocated yet. Click Allocate to distribute among verified NGOs.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedAllocs.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border border-[#E2E8E4] p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#1C2520]">
                          {a.ngoName} · {a.allocatedQuantity} meals
                        </span>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-xs text-[#4A5950]">
                        Match Score: <span className="font-mono">{a.matchScore}/100</span> ·{' '}
                        {a.distanceKm} km · {a.selectionReasons.join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#E2E8E4]">
              <Link
                to="/portal/tracking"
                className="text-xs font-semibold text-[#14532D] hover:underline"
              >
                Open Lifecycle Tracking →
              </Link>
              <Link
                to="/portal/messages"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Open Donation Chat
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </PortalLayout>
  );
}
