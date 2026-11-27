import {
  AllocationCriteriaScore,
  Donation,
  DonationAllocation,
  NGO,
} from '../types';

function haversineDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return 4.5; // Default city fallback when coordinates are absent
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/**
 * Intelligent Multi-NGO Donation Allocation Engine
 * Evaluates 9 criteria and splits confirmed donations across suitable verified NGOs
 * without ever exceeding remainingQuantity or allocating expired food.
 */
export function computeIntelligentAllocationPlan(
  donation: Donation,
  ngos: NGO[],
  existingAllocations: DonationAllocation[]
): {
  eligible: boolean;
  blockReason?: string;
  recommendations: AllocationCriteriaScore[];
} {
  // Rule: Never allocate expired or unsuitable food
  const deadlineMs = new Date(donation.safeUseDeadline).getTime();
  if (Number.isNaN(deadlineMs) || deadlineMs <= Date.now()) {
    return {
      eligible: false,
      blockReason: 'Donation has passed its safe-use deadline and cannot be allocated.',
      recommendations: [],
    };
  }

  if (donation.remainingQuantity <= 0 || donation.status === 'CANCELLED' || donation.status === 'EXPIRED') {
    return {
      eligible: false,
      blockReason: 'No remaining unallocated meals available for this donation.',
      recommendations: [],
    };
  }

  const hoursUntilDeadline = Math.max(0.5, (deadlineMs - Date.now()) / 3600000);

  // Filter verified NGOs that accept the food category and aren't already assigned to this donation
  const alreadyAssignedNgoIds = new Set(
    existingAllocations
      .filter(
        (a) =>
          a.donationId === donation.id &&
          a.status !== 'REJECTED' &&
          a.status !== 'CANCELLED'
      )
      .map((a) => a.ngoId)
  );

  const scoredNgos = ngos
    .filter(
      (ngo) =>
        ngo.verificationStatus === 'APPROVED' &&
        ngo.acceptedCategories.includes(donation.category) &&
        !alreadyAssignedNgoIds.has(ngo.id)
    )
    .map((ngo) => {
      const distanceKm = haversineDistanceKm(
        donation.latitude,
        donation.longitude,
        ngo.latitude,
        ngo.longitude
      );

      // Count active pending allocations for this NGO
      const pendingCount = existingAllocations.filter(
        (a) =>
          a.ngoId === ngo.id &&
          (a.status === 'PENDING' || a.status === 'ACCEPTED' || a.status === 'PICKUP_SCHEDULED')
      ).length;

      const reasons: string[] = [];
      let score = 0;

      // 1. Location & service area proximity (max 25 pts)
      const sameCity =
        ngo.city.toLowerCase() === donation.city.toLowerCase() ||
        ngo.serviceLocations.some((loc) =>
          donation.pickupAddress.toLowerCase().includes(loc.toLowerCase())
        );
      if (distanceKm <= 3) {
        score += 25;
        reasons.push(`Close proximity (${distanceKm} km away)`);
      } else if (distanceKm <= 7 || sameCity) {
        score += 18;
        reasons.push(`Covers service zone (${distanceKm} km)`);
      } else {
        score += 8;
        reasons.push(`Extended travel distance (${distanceKm} km)`);
      }

      // 2. Transport & deadline urgency (max 20 pts)
      if (ngo.transportAvailable) {
        score += hoursUntilDeadline < 3 ? 20 : 15;
        reasons.push(`Own transport ready (${ngo.transportType})`);
      } else {
        score += hoursUntilDeadline < 3 ? 4 : 10;
        reasons.push('Relies on volunteer pickup');
      }

      // 3. Beneficiary need & daily meal requirement (max 25 pts)
      const needRatio = Math.min(1, ngo.dailyMealRequirement / 80);
      const needPts = Math.round(needRatio * 25);
      score += needPts;
      reasons.push(
        `Serves ${ngo.beneficiaryCount} beneficiaries (${ngo.dailyMealRequirement} meals/day need)`
      );

      // 4. Collection capacity & category fit (max 20 pts)
      if (ngo.maxCollectionCapacity >= 30) {
        score += 15;
      } else {
        score += 10;
      }
      reasons.push(`Accepts ${donation.category.replace(/_/g, ' ').toLowerCase()} (cap ${ngo.maxCollectionCapacity})`);

      // 5. Existing pending load penalty (max 10 pts)
      const loadPts = Math.max(0, 10 - pendingCount * 4);
      score += loadPts;
      if (pendingCount === 0) {
        reasons.push('No conflicting active pickups');
      } else {
        reasons.push(`${pendingCount} active pickup(s) in queue`);
      }

      const maxCollectable = Math.min(ngo.maxCollectionCapacity, ngo.dailyMealRequirement);

      return {
        ngoId: ngo.id,
        ngoName: ngo.ngoName,
        score: Math.min(100, score),
        distanceKm,
        requestedMeals: maxCollectable,
        recommendedMeals: 0,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Greedy split across top ranked NGOs up to donation.remainingQuantity
  let remainingToDistribute = donation.remainingQuantity;
  const recommendations: AllocationCriteriaScore[] = [];

  for (const item of scoredNgos) {
    if (remainingToDistribute <= 0) break;
    const allocQty = Math.min(remainingToDistribute, item.requestedMeals);
    if (allocQty > 0) {
      recommendations.push({
        ...item,
        recommendedMeals: allocQty,
      });
      remainingToDistribute -= allocQty;
    }
  }

  return {
    eligible: recommendations.length > 0,
    blockReason:
      recommendations.length === 0
        ? 'No verified NGOs match this food category and pickup window right now.'
        : undefined,
    recommendations,
  };
}
