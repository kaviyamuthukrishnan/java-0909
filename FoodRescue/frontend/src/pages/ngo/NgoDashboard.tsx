import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake, Truck } from 'lucide-react';
import {
  CategoryBreakdownChart,
  MonthlyRescueTrendChart,
  WeeklyInventoryChart,
} from '../../components/charts/SurplusCharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { FOOD_CATEGORY_LABELS, formatDateTime } from '../../utils/formatters';

export function NgoDashboard() {
  const { currentUser, ngos, donations, allocations, pickups, notifications, demoMode } = useApp();

  const ngoId = currentUser?.organizationId || 'ngo-1';
  const ngo = ngos.find((n) => n.id === ngoId) || ngos[0];

  const availableDonations = donations.filter(
    (d) =>
      d.remainingQuantity > 0 &&
      d.status !== 'EXPIRED' &&
      d.status !== 'CANCELLED' &&
      new Date(d.safeUseDeadline).getTime() > Date.now()
  );

  const myAllocations = allocations.filter((a) => a.ngoId === ngoId);
  const recommendedPending = myAllocations.filter((a) => a.status === 'PENDING');
  const acceptedAllocs = myAllocations.filter(
    (a) => a.status === 'ACCEPTED' || a.status === 'PICKUP_SCHEDULED'
  );
  const myPickups = pickups.filter((p) => p.ngoId === ngoId);
  const pendingPickups = myPickups.filter(
    (p) => p.status === 'SCHEDULED' || p.status === 'IN_TRANSIT' || p.status === 'DELAYED'
  );
  const completedPickups = myPickups.filter(
    (p) => p.status === 'COLLECTED' || p.status === 'DISTRIBUTED'
  );
  const totalMealsReceived = completedPickups.reduce(
    (s, p) => s + (p.collectedQuantity || p.assignedQuantity),
    0
  );
  const totalBeneficiariesServed = completedPickups.reduce(
    (s, p) => s + (p.beneficiariesFed || p.assignedQuantity),
    0
  );

  const acceptanceRate =
    myAllocations.length > 0
      ? Math.round(
          (myAllocations.filter((a) => a.status !== 'REJECTED').length / myAllocations.length) * 100
        )
      : 100;

  const weeklyChartData = useMemo(
    () => [
      { label: 'Mon', prepared: 40, sold: 38, surplus: 2 },
      { label: 'Tue', prepared: 45, sold: 45, surplus: 0 },
      { label: 'Wed', prepared: 50, sold: 48, surplus: 2 },
      { label: 'Thu', prepared: 35, sold: 35, surplus: 0 },
      { label: 'Fri', prepared: 60, sold: 55, surplus: 5 },
      { label: 'Sat', prepared: 70, sold: 68, surplus: 2 },
      { label: 'Sun', prepared: 45, sold: 45, surplus: 0 },
    ],
    []
  );

  const monthlyTrendData = useMemo(
    () => [
      { period: 'Wk 1', rescued: 210, unclaimed: 10 },
      { period: 'Wk 2', rescued: 265, unclaimed: 5 },
      { period: 'Wk 3', rescued: 290, unclaimed: 8 },
      { period: 'Wk 4', rescued: 325, unclaimed: 4 },
    ],
    []
  );

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    myAllocations.forEach((a) => {
      const label = FOOD_CATEGORY_LABELS[a.category];
      map[label] = (map[label] || 0) + a.allocatedQuantity;
    });
    const entries = Object.entries(map).map(([name, value]) => ({ name, value }));
    return entries.length > 0 ? entries : [{ name: 'Cooked Meals', value: 45 }];
  }, [myAllocations]);

  const myNotifs = notifications.filter((n) => n.targetRole === 'NGO');

  return (
    <PortalLayout breadcrumb="NGO Rescue Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-[#1C2520]">{ngo.ngoName}</h1>
              <StatusBadge status={ngo.verificationStatus} />
            </div>
            <p className="mt-1 text-sm text-[#4A5950]">
              Daily Requirement: <span className="font-mono">{ngo.dailyMealRequirement}</span> meals
              · Capacity: <span className="font-mono">{ngo.maxCollectionCapacity}</span> meals{' '}
              {demoMode ? '· DEMO DATA' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/ngo/collections"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D3DDD6] bg-white px-3.5 py-2 text-sm font-medium text-[#1C2520] hover:bg-[#F2F6F3] whitespace-nowrap"
            >
              <Truck className="w-4 h-4" />
              Manage Pickups
            </Link>
            <Link
              to="/ngo/available"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C2410C] whitespace-nowrap"
            >
              <HeartHandshake className="w-4 h-4" />
              Browse Donations ({recommendedPending.length + availableDonations.length})
            </Link>
          </div>
        </div>

        {/* 7 NGO KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Available Donations', value: availableDonations.length },
            { label: 'Recommended Matches', value: recommendedPending.length, accent: 'text-[#EA580C]' },
            { label: 'Accepted Allocations', value: acceptedAllocs.length, accent: 'text-[#14532D]' },
            { label: 'Pending Pickups', value: pendingPickups.length },
            { label: 'Completed Pickups', value: completedPickups.length },
            { label: 'Meals Received', value: totalMealsReceived, accent: 'text-[#14532D]' },
            { label: 'Beneficiaries Served', value: totalBeneficiariesServed },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-[#E2E8E4] bg-white p-4">
              <p className="text-xs text-[#4A5950] truncate">{kpi.label}</p>
              <p className={`mt-1.5 font-mono text-2xl font-bold tabular-nums ${kpi.accent || 'text-[#1C2520]'}`}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-semibold text-[#1C2520]">
                  Weekly Meals Received & Distributed
                </h2>
                <p className="text-xs text-[#4A5950]">
                  Sample weekly intake vs. community distribution {demoMode ? '(DEMO DATA)' : ''}
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[#14532D]">
                Acceptance Rate: {acceptanceRate}%
              </span>
            </div>
            <WeeklyInventoryChart data={weeklyChartData} />
          </div>

          <div className="rounded-xl border border-[#E2E8E4] bg-white p-5">
            <div className="mb-4">
              <h2 className="font-display text-base font-semibold text-[#1C2520]">
                Monthly Collection Trend
              </h2>
              <p className="text-xs text-[#4A5950]">Rescued meals delivered across 4-week cycle</p>
            </div>
            <MonthlyRescueTrendChart data={monthlyTrendData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-[#E2E8E4] bg-white p-5">
            <h2 className="font-display text-base font-semibold text-[#1C2520] mb-2">
              Food Category Breakdown
            </h2>
            <CategoryBreakdownChart data={categoryBreakdown} />
          </div>

          <div className="lg:col-span-7 rounded-xl border border-[#E2E8E4] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#1C2520]">
                Upcoming Pickup Schedules & Alerts
              </h2>
              <Link
                to="/ngo/collections"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#14532D] hover:underline"
              >
                All Pickups <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[#E2E8E4]">
              {myPickups.slice(0, 3).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1C2520] truncate">
                      {p.providerName} · {p.assignedQuantity} meals
                    </p>
                    <p className="text-xs text-[#4A5950] font-mono">
                      {p.donationId} · Scheduled {formatDateTime(p.scheduledTime)}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
            {myNotifs.length > 0 && (
              <div className="pt-3 border-t border-[#E2E8E4] space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4A5950]">
                  Recent NGO Alerts
                </p>
                {myNotifs.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg bg-[#FAFBF9] border border-[#E2E8E4] px-3 py-2 text-xs text-[#1C2520]"
                  >
                    <span className="font-semibold">{n.title}:</span> {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
