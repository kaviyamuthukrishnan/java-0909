import {
  AllocationStatus,
  DonationStatus,
  FoodCategory,
  VerificationStatus,
} from '../types';

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  COOKED_MEALS: 'Cooked Meals',
  RICE_AND_CURRIES: 'Rice & Curries',
  BAKERY_AND_BREAD: 'Bakery & Bread',
  FRESH_PRODUCE: 'Fresh Produce',
  DAIRY_AND_DESSERTS: 'Dairy & Desserts',
  PACKAGED_STAPLES: 'Packaged Staples',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  NOT_SUBMITTED: 'Not Submitted',
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CORRECTION_REQUIRED: 'Correction Required',
};

export const DONATION_STATUS_LABELS: Record<DonationStatus, string> = {
  PENDING_ALLOCATION: 'Pending Allocation',
  PARTIALLY_ALLOCATED: 'Partially Allocated',
  FULLY_ALLOCATED: 'Fully Allocated',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  COLLECTED: 'Collected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  UNCLAIMED: 'Unclaimed',
};

export const ALLOCATION_STATUS_LABELS: Record<AllocationStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  COLLECTED: 'Collected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export function formatDateTime(isoString: string): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateOnly(isoString: string): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatTimeRemaining(deadlineIso: string): {
  label: string;
  isExpired: boolean;
  isUrgent: boolean;
} {
  const diffMs = new Date(deadlineIso).getTime() - Date.now();
  if (Number.isNaN(diffMs)) {
    return { label: 'Unknown', isExpired: false, isUrgent: false };
  }
  if (diffMs <= 0) {
    return { label: 'Expired', isExpired: true, isUrgent: true };
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    label: hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`,
    isExpired: false,
    isUrgent: totalMinutes <= 120,
  };
}

export function formatMeals(count: number): string {
  return `${new Intl.NumberFormat('en-IN').format(count)} ${count === 1 ? 'meal' : 'meals'}`;
}
