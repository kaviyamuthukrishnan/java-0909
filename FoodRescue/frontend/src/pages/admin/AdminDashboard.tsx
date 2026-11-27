import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  CategoryBreakdownChart,
  MonthlyRescueTrendChart,
  WeeklyInventoryChart,
} from '../../components/charts/SurplusCharts';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { FOOD_CATEGORY_LABELS } from '../../utils/formatters';

export function AdminDashboard() {
  const { providers, ngos, donations, pickups, complaints, wasteHistory, demoMode } = useApp();
  const [reportPeriod, setReportPeriod] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');

  const verifiedProviders = providers.filter((p) => p.verificationStatus === 'APPROVED').length;
  const pendingProviders = providers.filter((p) => p.verificationStatus === 'PENDING_REVIEW').length;
  const verifiedNgos = ngos.filter((n) => n.verificationStatus === 'APPROVED').length;
  const pendingNgos = ngos.filter((n) => n.verificationStatus === 'PENDING_REVIEW').length;

  const confirmedFoodQty = donations.reduce((s, d) => s + d.confirmedQuantity, 0);
  const allocatedFoodQty = donations.reduce((s, d) => s + d.allocatedQuantity, 0);
  const collectedFoodQty = pickups
    .filter((p) => p.status === 'COLLECTED' || p.status === 'DISTRIBUTED')
    .reduce((s, p) => s + (p.collectedQuantity || p.assignedQuantity), 0);
  const unclaimedCount = donations.filter(
    (d) => d.status === 'UNCLAIMED' || d.status === 'EXPIRED'
  ).length;
  const completedCount = donations.filter((d) => d.status === 'COMPLETED').length;

  const openComplaints = complaints.filter((c) => c.status !== 'RESOLVED').length;

  const weeklySummary = useMemo(() => {
    const slice = reportPeriod === 'WEEKLY' ? wasteHistory.slice(-7) : wasteHistory.slice(-10);
    return slice.map((h) => ({
      label: h.date.slice(5),
      prepared: h.preparedMeals,
      sold: h.soldMeals,
      surplus: h.surplusMeals,
    }));
  }, [wasteHistory, reportPeriod]);

  const rescueTrend = useMemo(
    () => [
      { period: 'Week 1', rescued: 320, unclaimed: 18 },
      { period: 'Week 2', rescued: 410, unclaimed: 14 },
      { period: 'Week 3', rescued: 485, unclaimed: 9 },
      { period: 'Week 4', rescued: confirmedFoodQty, unclaimed: unclaimedCount * 10 },
    ],
    [confirmedFoodQty, unclaimedCount]
  );

  const categorySlices = useMemo(() => {
    const map: Record<string, number> = {};
    donations.forEach((d) => {
      const lbl = FOOD_CATEGORY_LABELS[d.category];
      map[lbl] = (map[lbl] || 0) + d.confirmedQuantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [donations]);

  return (
    <PortalLayout breadcrumb="Administrator Overview & Analytics">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Platform Governance & Analytics
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              System-wide verification queues, confirmed vs. collected meals, and intervention
              metrics {demoMode ? '· DEMO DATA' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/admin/verifications"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F4022]"
            >
              <ShieldCheck className="w-4 h-4" />
              Pending Verifications ({pendingProviders + pendingNgos})
            </Link>
            <Link
              to="/admin/monitoring"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D3DDD6] bg-white px-4 py-2 text-sm font-medium text-[#1C2520] hover:bg-[#F2F6F3]"
            >
              Allocation Monitor
            </Link>
          </div>
        </div>

        {/* 11 Admin KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Registered Providers', value: providers.length },
            { label: 'Verified Providers', value: verifiedProviders, accent: 'text-[#14532D]' },
            { label: 'Pending Providers', value: pendingProviders, accent: 'text-[#EA580C]' },
            { label: 'Registered NGOs', value: ngos.length },
            { label: 'Verified NGOs', value: verifiedNgos, accent: 'text-[#14532D]' },
            { label: 'Total Donations', value: donations.length },
            { label: 'Confirmed Meals', value: confirmedFoodQty },
            { label: 'Allocated Meals', value: allocatedFoodQty, accent: 'text-[#14532D]' },
            { label: 'Collected Meals', value: collectedFoodQty, accent: 'text-[#14532D]' },
            { label: 'Unclaimed Batches', value: unclaimedCount },
            { label: 'Completed Donations', value: completedCount },
            { label: 'Open Complaints', value: openComplaints, accent: openComplaints > 0 ? 'text-[#EA580C]' : '' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-[#E2E8E4] bg-white p-4">
              <p className="text-xs text-[#4A5950] truncate">{k.label}</p>
              <p className={`mt-1.5 font-mono text-2xl font-bold tabular-nums ${k.accent || 'text-[#1C2520]'}`}>
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-semibold text-[#1C2520]">
                  Provider Supply & Surplus Overview
                </h2>
                <p className="text-xs text-[#4A5950]">
                  Measured & sample historical records {demoMode ? '(DEMO DATA)' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#F2F6F3] p-1">
                {(['WEEKLY', 'MONTHLY'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReportPeriod(p)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      reportPeriod === p ? 'bg-white text-[#14532D] shadow-sm' : 'text-[#4A5950]'
                    }`}
                  >
                    {p === 'WEEKLY' ? 'Weekly' : '10-Day'}
                  </button>
                ))}
              </div>
            </div>
            <WeeklyInventoryChart data={weeklySummary} />
          </div>

          <div className="rounded-xl border border-[#E2E8E4] bg-white p-5">
            <div className="mb-4">
              <h2 className="font-display text-base font-semibold text-[#1C2520]">
                Platform Rescue & Unclaimed Trend
              </h2>
              <p className="text-xs text-[#4A5950]">
                Estimated meals rescued vs. unallocated/expired
              </p>
            </div>
            <MonthlyRescueTrendChart data={rescueTrend} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-[#E2E8E4] bg-white p-5">
            <h2 className="font-display text-base font-semibold text-[#1C2520] mb-2">
              Donated Volume by Food Category
            </h2>
            <CategoryBreakdownChart data={categorySlices} />
          </div>

          <div className="lg:col-span-7 rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-4">
            <h2 className="font-display text-base font-semibold text-[#1C2520]">
              Priority Action Queue
            </h2>
            <div className="space-y-3">
              {(pendingProviders > 0 || pendingNgos > 0) && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1C2520]">
                      {pendingProviders + pendingNgos} Organization(s) Awaiting Document Verification
                    </p>
                    <p className="text-xs text-[#4A5950]">
                      {pendingProviders} Food Provider(s) · {pendingNgos} NGO(s)
                    </p>
                  </div>
                  <Link
                    to="/admin/verifications"
                    className="rounded-lg bg-[#14532D] px-3.5 py-2 text-xs font-semibold text-white"
                  >
                    Review Queue
                  </Link>
                </div>
              )}

              {openComplaints > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-[#EA580C]" />
                    <div>
                      <p className="text-sm font-semibold text-[#1C2520]">
                        {openComplaints} Open Support Complaint(s)
                      </p>
                      <p className="text-xs text-[#4A5950]">
                        Review collection delays or quantity discrepancies
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/admin/complaints"
                    className="rounded-lg bg-[#EA580C] px-3.5 py-2 text-xs font-semibold text-white"
                  >
                    Investigate
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
