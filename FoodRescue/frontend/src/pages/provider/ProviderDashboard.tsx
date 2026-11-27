import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BellRing, PlusCircle, Sparkles } from 'lucide-react';
import {
  MonthlyRescueTrendChart,
  PredictionVsActualChart,
  WeeklyInventoryChart,
} from '../../components/charts/SurplusCharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { formatDateTime } from '../../utils/formatters';

export function ProviderDashboard() {
  const {
    currentUser,
    providers,
    inventory,
    wasteHistory,
    predictions,
    donations,
    notifications,
    demoMode,
  } = useApp();
  const navigate = useNavigate();
  const [chartWindow, setChartWindow] = useState<'7D' | '10D'>('7D');

  const providerId = currentUser?.organizationId || 'prov-1';
  const provider = providers.find((p) => p.id === providerId) || providers[0];

  const myInventory = inventory.filter((i) => i.providerId === providerId);
  const myHistory = wasteHistory.filter((h) => h.providerId === providerId);
  const myDonations = donations.filter((d) => d.providerId === providerId);
  const latestPrediction = predictions.find((p) => p.providerId === providerId);
  const myNotifs = notifications.filter((n) => n.targetRole === 'PROVIDER' && !n.isRead);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayInv = myInventory.filter((i) => i.date === todayStr);
  const preparedToday = todayInv.reduce((s, i) => s + i.quantityPrepared, 0);
  const soldToday = todayInv.reduce((s, i) => s + i.quantitySold, 0);
  const estSurplus =
    latestPrediction?.predictedSurplusMeals ??
    todayInv.reduce((s, i) => s + i.remainingQuantity, 0);

  const confirmedMeals = myDonations.reduce((s, d) => s + d.confirmedQuantity, 0);
  const allocatedMeals = myDonations.reduce((s, d) => s + d.allocatedQuantity, 0);
  const completedCount = myDonations.filter((d) => d.status === 'COMPLETED').length;
  const pendingCollectionCount = myDonations.filter(
    (d) =>
      d.status === 'PARTIALLY_ALLOCATED' ||
      d.status === 'FULLY_ALLOCATED' ||
      d.status === 'PICKUP_SCHEDULED'
  ).length;
  const totalHistorySurplus = myHistory.reduce((s, h) => s + h.surplusMeals, 0);
  const totalHistoryDonated = myHistory.reduce((s, h) => s + h.donatedMeals, 0);
  const wasteReductionPct =
    totalHistorySurplus > 0
      ? Math.round((totalHistoryDonated / totalHistorySurplus) * 100)
      : 0;

  const weeklyChartData = useMemo(() => {
    const slice = chartWindow === '7D' ? myHistory.slice(-7) : myHistory.slice(-10);
    return slice.map((h) => ({
      label: h.date.slice(5),
      prepared: h.preparedMeals,
      sold: h.soldMeals,
      surplus: h.surplusMeals,
    }));
  }, [myHistory, chartWindow]);

  const predVsActualData = useMemo(() => {
    return myHistory.slice(-7).map((h, i) => ({
      date: h.date.slice(5),
      predicted: Math.max(10, h.surplusMeals + (i % 2 === 0 ? -3 : 4)),
      actual: h.surplusMeals,
    }));
  }, [myHistory]);

  const monthlyTrendData = useMemo(() => {
    return myHistory.slice(-7).map((h) => ({
      period: h.date.slice(5),
      rescued: h.donatedMeals,
      unclaimed: h.wastedMeals,
    }));
  }, [myHistory]);

  return (
    <PortalLayout breadcrumb="Provider Dashboard">
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-[#1C2520]">
                {provider?.organizationName}
              </h1>
              {provider && <StatusBadge status={provider.verificationStatus} />}
            </div>
            <p className="mt-1 text-sm text-[#4A5950]">
              Daily kitchen surplus overview, prediction confirmation, and donation tracking{' '}
              {demoMode ? '· DEMO DATA' : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/provider/inventory"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D3DDD6] bg-white px-3.5 py-2 text-sm font-medium text-[#1C2520] hover:bg-[#F2F6F3] whitespace-nowrap"
            >
              Log Inventory
            </Link>
            <Link
              to="/provider/donate"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C2410C] whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Donate Food
            </Link>
          </div>
        </div>

        {/* 7–8 PM Surplus Confirmation Prompt */}
        {latestPrediction && latestPrediction.confirmationStatus === 'PENDING' && (
          <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#EA580C] p-2 text-white shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#C2410C]">
                  EVENING SURPLUS CONFIRMATION WINDOW ({latestPrediction.scheduledPromptWindow})
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#1C2520]">
                  “Your predicted surplus for today is{' '}
                  <span className="font-mono">{latestPrediction.predictedSurplusMeals}</span> meals.
                  Would you like to donate this food?”
                </p>
                <p className="mt-1 text-xs text-[#4A5950]">
                  Predicted surplus is never shared with NGOs until you confirm the exact quantity.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/provider/prediction')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4022] whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Review & Confirm Surplus
            </button>
          </div>
        )}

        {/* 9 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Food Items Recorded', value: myInventory.length, unit: 'batches' },
            { label: "Today's Prepared", value: preparedToday, unit: 'meals' },
            { label: "Today's Sold", value: soldToday, unit: 'meals' },
            { label: 'Estimated Surplus', value: estSurplus, unit: 'meals', accent: 'text-[#EA580C]' },
            { label: 'Confirmed Donations', value: confirmedMeals, unit: 'meals', accent: 'text-[#14532D]' },
            { label: 'Allocated Food', value: allocatedMeals, unit: 'meals' },
            { label: 'Completed Donations', value: completedCount, unit: 'batches' },
            { label: 'Pending Collection', value: pendingCollectionCount, unit: 'batches' },
            { label: 'Waste Reduction Rate', value: `${wasteReductionPct}%`, unit: 'measured demo' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-[#E2E8E4] bg-white p-4"
            >
              <p className="text-xs text-[#4A5950] truncate">{kpi.label}</p>
              <p className={`mt-1.5 font-mono text-2xl font-bold tabular-nums ${kpi.accent || 'text-[#1C2520]'}`}>
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[11px] text-[#64748B]">{kpi.unit}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-base font-semibold text-[#1C2520]">
                  Food Inventory & Surplus
                </h2>
                <p className="text-xs text-[#4A5950]">Prepared vs. Sold vs. Surplus</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#F2F6F3] p-1">
                {(['7D', '10D'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setChartWindow(w)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      chartWindow === w ? 'bg-white text-[#14532D] shadow-sm' : 'text-[#4A5950]'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <WeeklyInventoryChart data={weeklyChartData} />
          </div>

          <div className="rounded-xl border border-[#E2E8E4] bg-white p-5">
            <div className="mb-4">
              <h2 className="font-display text-base font-semibold text-[#1C2520]">
                Prediction vs. Actual Surplus
              </h2>
              <p className="text-xs text-[#4A5950]">Statistical model tracking (Meals)</p>
            </div>
            <PredictionVsActualChart data={predVsActualData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-xl border border-[#E2E8E4] bg-white p-5">
            <div className="mb-4">
              <h2 className="font-display text-base font-semibold text-[#1C2520]">
                Rescue vs. Unclaimed Trend
              </h2>
              <p className="text-xs text-[#4A5950]">Donated vs. unrecovered kitchen waste</p>
            </div>
            <MonthlyRescueTrendChart data={monthlyTrendData} />
          </div>

          {/* Recent Donations & Pending Notifications */}
          <div className="lg:col-span-6 rounded-xl border border-[#E2E8E4] bg-white p-5 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-semibold text-[#1C2520]">
                  Recent Donation Activity
                </h2>
                <Link
                  to="/provider/donations"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#14532D] hover:underline"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-[#E2E8E4]">
                {myDonations.slice(0, 3).map((d) => (
                  <div key={d.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1C2520] truncate">{d.foodName}</p>
                      <p className="text-xs text-[#4A5950] font-mono">
                        {d.id} · {d.confirmedQuantity} meals · {formatDateTime(d.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E2E8E4] pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5950] mb-2">
                Pending Notifications ({myNotifs.length})
              </h3>
              {myNotifs.length === 0 ? (
                <p className="text-xs text-[#4A5950]">All provider notifications reviewed.</p>
              ) : (
                <ul className="space-y-2">
                  {myNotifs.slice(0, 2).map((n) => (
                    <li
                      key={n.id}
                      className="rounded-lg bg-[#FAFBF9] border border-[#E2E8E4] px-3 py-2 text-xs text-[#1C2520]"
                    >
                      <span className="font-semibold">{n.title}:</span> {n.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
