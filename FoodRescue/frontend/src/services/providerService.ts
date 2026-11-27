import {
  Donation,
  FoodProvider,
  InventoryRecord,
  PredictionConfirmationStatus,
  SurplusPrediction,
} from '../types';
import { apiRequest } from './apiClient';

/**
 * Spring Boot Provider Endpoints:
 * GET  /api/providers/me
 * PUT  /api/providers/me
 * POST /api/providers/me/documents
 * GET  /api/providers/me/inventory
 * POST /api/providers/me/inventory
 * PUT  /api/providers/me/inventory/{id}
 * DELETE /api/providers/me/inventory/{id}
 * GET  /api/providers/me/predictions/latest
 * POST /api/providers/me/predictions/{id}/confirm
 * POST /api/providers/me/donations/voluntary
 */
export const providerService = {
  getProfile: () => apiRequest<FoodProvider>('/api/providers/me'),
  updateProfile: (data: Partial<FoodProvider>) =>
    apiRequest<FoodProvider>('/api/providers/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  listInventory: () => apiRequest<InventoryRecord[]>('/api/providers/me/inventory'),
  createInventory: (record: Omit<InventoryRecord, 'id' | 'createdAt'>) =>
    apiRequest<InventoryRecord>('/api/providers/me/inventory', {
      method: 'POST',
      body: JSON.stringify(record),
    }),
  getLatestPrediction: () =>
    apiRequest<SurplusPrediction>('/api/providers/me/predictions/latest'),
  confirmPrediction: (
    predictionId: string,
    payload: {
      status: PredictionConfirmationStatus;
      confirmedMeals?: number;
      notes?: string;
    }
  ) =>
    apiRequest<{ prediction: SurplusPrediction; donation?: Donation }>(
      `/api/providers/me/predictions/${predictionId}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  createVoluntaryDonation: (payload: Omit<Donation, 'id' | 'createdAt' | 'allocatedQuantity' | 'remainingQuantity' | 'status'>) =>
    apiRequest<Donation>('/api/providers/me/donations/voluntary', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
