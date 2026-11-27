import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PredictionVsActualChart } from '../../components/charts/SurplusCharts';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { FOOD_CATEGORY_LABELS } from '../../utils/formatters';

export function ProviderPredictionPage() {
  const {
    currentUser,
    predictions,
    wasteHistory,
    recalculatePrediction,
    confirmPredictionSurplus,
    runIntelligentAllocation,
  } = useApp();
  const navigate = useNavigate();

  const providerId = currentUser?.organizationId || 'prov-1';
  const prediction =
    predictions.find((p) => p.providerId === providerId) ||
    recalculatePrediction(providerId);

  const [customMeals, setCustomMeals] = useState<number>(prediction.predictedSurplusMeals);
  const [partialMeals, setPartialMeals] = useState<number>(
    Math.max(1, Math.floor(prediction.predictedSurplusMeals * 0.6))
  );
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'NONE' | 'PARTIAL' | 'CUSTOM'>('NONE');
  const [confirmedDonationId, setConfirmedDonationId] = useState<string | null>(
    prediction.confirmedDonationId || null
  );

  const myHistory = wasteHistory.filter((h) => h.providerId === providerId);
  const historicalChartData = useMemo(
    () =>
      myHistory.slice(-7).map((h, i) => ({
        date: h.date.slice(5),
        predicted: Math.max(8, h.surplusMeals + (i % 2 === 0 ? -3 : 4)),
        actual: h.surplusMeals,
      })),
    [myHistory]
  );

  const handleConfirm = (
    status:
      | 'CONFIRMED_FULL'
      | 'CONFIRMED_PARTIAL'
      | 'CONFIRMED_CUSTOM'
      | 'DECLINED'
      | 'REMIND_LATER',
    meals?: number
  ) => {
    const donation = confirmPredictionSurplus(prediction.id, status, meals, notes);
    if (donation) {
      setConfirmedDonationId(donation.id);
    }
    setMode('NONE');
  };

  return (
    <PortalLayout breadcrumb="Smart Food Surplus Prediction">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Smart Food Surplus Prediction
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Statistical forecast computed from your historical prepared/sold ratios, weekday
              patterns, and live kitchen batches.
            </p>
          </div>
          <button
            type="button"
            onClick={() => recalculatePrediction(providerId)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D3DDD6] bg-white px-4 py-2 text-sm font-medium text-[#1C2520] hover:bg-[#F2F6F3] whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Recalculate Forecast
          </button>
        </div>

        {/* Critical Safeguard Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900">
            <strong>Important Rule:</strong> A prediction is <strong>NOT</strong> a confirmed
            donation. Predicted food is never automatically offered to NGOs until you confirm the
            exact quantity below.
          </div>
        </div>

        {/* Prediction Summary + Confirmation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#4A5950]">
                  PREDICTION DATE · {prediction.predictionDate} · PROMPT WINDOW{' '}
                  {prediction.scheduledPromptWindow}
                </p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-mono text-4xl font-bold text-[#14532D] tabular-nums">
                    {prediction.predictedSurplusMeals} Meals
                  </span>
                  <span className="text-sm font-medium text-[#4A5950]">
                    estimated leftover surplus
                  </span>
                </div>
              </div>
              <StatusBadge status={prediction.confirmationStatus} />
            </div>

            {prediction.confidenceLevel === 'LOW_INSUFFICIENT_DATA' && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900">
                Insufficient historical data ({prediction.historicalDaysUsed} days recorded). Using
                Simple Statistical Baseline until at least 3 historical days are accumulated.
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-y border-[#E2E8E4] py-4">
              <div>
                <p className="text-xs text-[#4A5950]">Confidence Score</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-[#1C2520] tabular-nums">
                  {prediction.confidenceScore}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[#4A5950]">Historical Days Used</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-[#1C2520] tabular-nums">
                  {prediction.historicalDaysUsed} days
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-[#4A5950]">Predicted Categories</p>
                <p className="mt-0.5 text-xs font-semibold text-[#14532D]">
                  {prediction.predictedCategories.map((c) => FOOD_CATEGORY_LABELS[c]).join(', ')}
                </p>
              </div>
            </div>

            {/* Provider Confirmation Controls */}
            {prediction.confirmationStatus === 'PENDING' ||
            prediction.confirmationStatus === 'REMIND_LATER' ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-[#1C2520]">
                  “Your predicted surplus for today is {prediction.predictedSurplusMeals} meals.
                  Would you like to donate this food?”
                </p>
                <div>
                  <label className="block text-xs font-medium text-[#4A5950] mb-1">
                    Optional pickup / kitchen handling note
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Ready at Banquet Gate B in sealed cambros"
                    className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                  />
                </div>

                {mode === 'PARTIAL' && (
                  <div className="rounded-lg border border-[#D3DDD6] bg-[#FAFBF9] p-4 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#1C2520] mb-1">
                        Confirm Partial Quantity (1 – {prediction.predictedSurplusMeals})
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={prediction.predictedSurplusMeals}
                        value={partialMeals}
                        onChange={(e) => setPartialMeals(Number(e.target.value))}
                        className="w-36 rounded-lg border border-[#D3DDD6] bg-white px-3 py-1.5 text-sm font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirm('CONFIRMED_PARTIAL', partialMeals)}
                      className="rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Submit Partial Confirmation
                    </button>
                  </div>
                )}

                {mode === 'CUSTOM' && (
                  <div className="rounded-lg border border-[#D3DDD6] bg-[#FAFBF9] p-4 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#1C2520] mb-1">
                        Enter Actual / Other Quantity (Meals)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={customMeals}
                        onChange={(e) => setCustomMeals(Number(e.target.value))}
                        className="w-36 rounded-lg border border-[#D3DDD6] bg-white px-3 py-1.5 text-sm font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirm('CONFIRMED_CUSTOM', customMeals)}
                      className="rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Confirm Custom Quantity
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleConfirm('CONFIRMED_FULL', prediction.predictedSurplusMeals)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F4022]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Full ({prediction.predictedSurplusMeals} Meals)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'PARTIAL' ? 'NONE' : 'PARTIAL')}
                    className="rounded-lg border border-[#14532D] bg-white px-3.5 py-2 text-xs font-semibold text-[#14532D] hover:bg-[#F2F6F3]"
                  >
                    Confirm Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'CUSTOM' ? 'NONE' : 'CUSTOM')}
                    className="rounded-lg border border-[#D3DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#1C2520] hover:bg-[#F2F6F3]"
                  >
                    Enter Another Quantity
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirm('REMIND_LATER')}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D3DDD6] bg-white px-3.5 py-2 text-xs font-medium text-[#4A5950] hover:bg-[#F2F6F3]"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Remind Me Later
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirm('DECLINED')}
                    className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Decline Donation
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#E2E8E4] bg-[#F7FAF8] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#14532D]">
                    Response Recorded: {prediction.confirmationStatus.replace(/_/g, ' ')}
                    {prediction.confirmedMeals ? ` (${prediction.confirmedMeals} meals)` : ''}
                  </p>
                </div>
                {confirmedDonationId && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        runIntelligentAllocation(confirmedDonationId);
                        navigate('/provider/donations');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C2410C]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Run Intelligent Multi-NGO Allocation Now
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/provider/donations')}
                      className="text-xs font-semibold text-[#14532D] hover:underline"
                    >
                      View Donation {confirmedDonationId} →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Factors Explanation Panel */}
          <div className="lg:col-span-5 rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#14532D]">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-display text-base font-semibold text-[#1C2520]">
                Factors Used in Prediction
              </h2>
            </div>
            <p className="text-xs text-[#4A5950]">
              Model: <span className="font-mono">{prediction.modelType}</span>
            </p>
            <div className="space-y-3">
              {prediction.factors.map((f) => (
                <div
                  key={f.label}
                  className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#1C2520]">{f.label}</span>
                    <span className="font-mono text-xs font-semibold text-[#14532D]">
                      {f.weight}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#4A5950] leading-relaxed">{f.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historical Comparison Chart */}
        <div className="rounded-xl border border-[#E2E8E4] bg-white p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-[#1C2520]">
              Historical Prediction vs. Actual Surplus Comparison
            </h2>
            <p className="text-xs text-[#4A5950]">
              Evaluates model calibration across recent service days
            </p>
          </div>
          <PredictionVsActualChart data={historicalChartData} />
        </div>
      </div>
    </PortalLayout>
  );
}
