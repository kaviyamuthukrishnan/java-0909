import {
  FoodCategory,
  InventoryRecord,
  PredictionFactor,
  SurplusPrediction,
  WasteHistory,
} from '../types';

/**
 * Statistical Food Surplus Prediction Engine
 * Mirrors the Java Spring Boot PredictionService algorithm so demo mode
 * executes real calculations from each provider's historical records.
 */
export function calculateStatisticalPrediction(
  providerId: string,
  wasteHistory: WasteHistory[],
  recentInventory: InventoryRecord[],
  targetDateIso: string
): SurplusPrediction {
  const providerHistory = wasteHistory.filter((h) => h.providerId === providerId);
  const providerInventory = recentInventory.filter((i) => i.providerId === providerId);

  const targetDate = new Date(targetDateIso);
  const dayOfWeek = targetDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Insufficient data fallback
  if (providerHistory.length < 3 && providerInventory.length < 2) {
    const fallbackMeals = providerInventory.reduce((sum, item) => sum + item.remainingQuantity, 0) || 18;
    return {
      id: `pred-${providerId}-${targetDateIso.slice(0, 10)}`,
      providerId,
      predictionDate: targetDateIso.slice(0, 10),
      scheduledPromptWindow: '19:00 – 20:00',
      predictedSurplusMeals: Math.round(fallbackMeals),
      predictedCategories: ['COOKED_MEALS'],
      confidenceScore: 48,
      confidenceLevel: 'LOW_INSUFFICIENT_DATA',
      historicalDaysUsed: providerHistory.length,
      modelType: 'SIMPLE_STATISTICAL_BASELINE',
      factors: [
        {
          label: 'Insufficient Historical Records',
          impact: `Only ${providerHistory.length} historical days available; using simple baseline average.`,
          weight: 'Baseline',
        },
        {
          label: 'Recent Inventory Remaining',
          impact: `${fallbackMeals} meals observed in latest inventory entries.`,
          weight: '100%',
        },
      ],
      confirmationStatus: 'PENDING',
    };
  }

  // Weighted historical moving average (recent records weighted higher)
  const sortedHistory = [...providerHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let weightedSurplusSum = 0;
  let totalWeights = 0;
  let weekendSurplusSum = 0;
  let weekendCount = 0;
  let weekdaySurplusSum = 0;
  let weekdayCount = 0;

  const categoryTotals: Partial<Record<FoodCategory, number>> = {};

  sortedHistory.forEach((record, index) => {
    const recencyWeight = 1 + index / sortedHistory.length;
    weightedSurplusSum += record.surplusMeals * recencyWeight;
    totalWeights += recencyWeight;

    const recordIsWeekend = record.dayOfWeek === 0 || record.dayOfWeek === 6;
    if (recordIsWeekend) {
      weekendSurplusSum += record.surplusMeals;
      weekendCount += 1;
    } else {
      weekdaySurplusSum += record.surplusMeals;
      weekdayCount += 1;
    }

    categoryTotals[record.category] = (categoryTotals[record.category] || 0) + record.surplusMeals;
  });

  const baseMean = totalWeights > 0 ? weightedSurplusSum / totalWeights : 35;

  // Weekend/weekday pattern adjustment
  const weekdayAvg = weekdayCount > 0 ? weekdaySurplusSum / weekdayCount : baseMean;
  const weekendAvg = weekendCount > 0 ? weekendSurplusSum / weekendCount : baseMean;
  const dayFactor = isWeekend && weekdayAvg > 0
    ? Math.min(1.35, Math.max(0.75, weekendAvg / weekdayAvg))
    : 1.0;

  // Today's live inventory signal (if provider already logged items today)
  const todayStr = targetDateIso.slice(0, 10);
  const todaysEntries = providerInventory.filter((i) => i.date === todayStr);
  const todaysRemaining = todaysEntries.reduce((sum, i) => sum + i.remainingQuantity, 0);
  const todaysPrepared = todaysEntries.reduce((sum, i) => sum + i.quantityPrepared, 0);
  const todaysSold = todaysEntries.reduce((sum, i) => sum + i.quantitySold, 0);

  let predictedMeals = Math.round(baseMean * dayFactor);
  if (todaysEntries.length > 0 && todaysRemaining > 0) {
    // Blend 60% historical statistical forecast + 40% current day unallocated remainder
    predictedMeals = Math.round(predictedMeals * 0.6 + todaysRemaining * 0.4);
  }

  // Top predicted categories
  const topCategories = (Object.entries(categoryTotals) as [FoodCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => cat);

  const avgPrepared =
    sortedHistory.reduce((acc, r) => acc + r.preparedMeals, 0) / Math.max(1, sortedHistory.length);
  const avgSold =
    sortedHistory.reduce((acc, r) => acc + r.soldMeals, 0) / Math.max(1, sortedHistory.length);

  const confidenceScore = Math.min(
    94,
    Math.round(58 + Math.min(25, sortedHistory.length * 2.5) + (todaysEntries.length > 0 ? 8 : 0))
  );

  const factors: PredictionFactor[] = [
    {
      label: 'Historical Prepared vs. Sold Ratio',
      impact: `Avg ${Math.round(avgPrepared)} prepared vs. ${Math.round(avgSold)} sold (${Math.round(
        ((avgPrepared - avgSold) / Math.max(1, avgPrepared)) * 100
      )}% surplus rate)`,
      weight: '45%',
    },
    {
      label: isWeekend ? 'Weekend Demand Pattern' : 'Weekday Demand Pattern',
      impact: isWeekend
        ? `Weekend factor ${dayFactor.toFixed(2)}x applied from past Sat/Sun records`
        : `Standard weekday demand baseline (${Math.round(weekdayAvg)} avg surplus meals)`,
      weight: '25%',
    },
    {
      label: 'Food Category Volatility',
      impact: `Highest surplus observed in ${topCategories.join(', ').replace(/_/g, ' ')}`,
      weight: '15%',
    },
    {
      label: "Today's Live Kitchen Signal",
      impact:
        todaysEntries.length > 0
          ? `${todaysPrepared} prepared / ${todaysSold} sold so far (${todaysRemaining} remaining)`
          : 'No inventory logged yet for target date; relying on historical window',
      weight: '15%',
    },
  ];

  return {
    id: `pred-${providerId}-${todayStr}`,
    providerId,
    predictionDate: todayStr,
    scheduledPromptWindow: '19:00 – 20:00',
    predictedSurplusMeals: Math.max(5, predictedMeals),
    predictedCategories: topCategories.length > 0 ? topCategories : ['COOKED_MEALS'],
    confidenceScore,
    confidenceLevel: confidenceScore >= 75 ? 'HIGH' : 'MEDIUM',
    historicalDaysUsed: sortedHistory.length,
    modelType: 'WEIGHTED_HISTORICAL_REGRESSION',
    factors,
    confirmationStatus: 'PENDING',
  };
}
