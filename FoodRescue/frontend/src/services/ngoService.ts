import { Donation, DonationAllocation, NGO, PickupRecord } from '../types';
import { apiRequest } from './apiClient';

/**
 * Spring Boot NGO Endpoints:
 * GET  /api/ngos/me
 * PUT  /api/ngos/me
 * GET  /api/ngos/donations/available
 * GET  /api/ngos/me/allocations
 * POST /api/ngos/me/allocations/{id}/accept
 * POST /api/ngos/me/allocations/{id}/decline
 * GET  /api/ngos/me/pickups
 * POST /api/ngos/me/pickups/{id}/collect
 * POST /api/ngos/me/pickups/{id}/issue
 */
export const ngoService = {
  getProfile: () => apiRequest<NGO>('/api/ngos/me'),
  updateProfile: (data: Partial<NGO>) =>
    apiRequest<NGO>('/api/ngos/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  listAvailableDonations: () => apiRequest<Donation[]>('/api/ngos/donations/available'),
  listMyAllocations: () => apiRequest<DonationAllocation[]>('/api/ngos/me/allocations'),
  acceptAllocation: (
    allocationId: string,
    payload: {
      acceptedQuantity: number;
      scheduledPickupTime: string;
      transportMode: string;
    }
  ) =>
    apiRequest<DonationAllocation>(`/api/ngos/me/allocations/${allocationId}/accept`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  declineAllocation: (allocationId: string, reason: string) =>
    apiRequest<DonationAllocation>(`/api/ngos/me/allocations/${allocationId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  listPickups: () => apiRequest<PickupRecord[]>('/api/ngos/me/pickups'),
  confirmCollection: (
    pickupId: string,
    payload: { collectedQuantity: number; beneficiariesFed?: number }
  ) =>
    apiRequest<PickupRecord>(`/api/ngos/me/pickups/${pickupId}/collect`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
