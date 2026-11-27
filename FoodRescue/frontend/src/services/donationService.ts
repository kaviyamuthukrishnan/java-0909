import { Donation, DonationAllocation } from '../types';
import { apiRequest } from './apiClient';

/**
 * Spring Boot Donation & Allocation Endpoints:
 * GET  /api/donations
 * GET  /api/donations/{id}
 * POST /api/allocations/run/{donationId}
 * POST /api/allocations/manual
 */
export const donationService = {
  listAll: () => apiRequest<Donation[]>('/api/donations'),
  getById: (id: string) => apiRequest<Donation>(`/api/donations/${id}`),
};

export const allocationService = {
  runIntelligentAllocation: (donationId: string) =>
    apiRequest<DonationAllocation[]>(`/api/allocations/run/${donationId}`, {
      method: 'POST',
    }),
  assignManualAllocation: (payload: {
    donationId: string;
    ngoId: string;
    quantity: number;
    reason: string;
  }) =>
    apiRequest<DonationAllocation>('/api/allocations/manual', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
