import {
  AuditLog,
  Complaint,
  FoodProvider,
  NGO,
  User,
  VerificationStatus,
} from '../types';
import { apiRequest } from './apiClient';

/**
 * Spring Boot Admin Governance Endpoints:
 * GET  /api/admin/providers
 * POST /api/admin/providers/{id}/verify
 * GET  /api/admin/ngos
 * POST /api/admin/ngos/{id}/verify
 * GET  /api/admin/users
 * PATCH /api/admin/users/{id}/status
 * GET  /api/admin/complaints
 * POST /api/admin/complaints/{id}/resolve
 * GET  /api/admin/audit-logs
 */
export const adminService = {
  listProviders: () => apiRequest<FoodProvider[]>('/api/admin/providers'),
  verifyProvider: (
    providerId: string,
    status: VerificationStatus,
    remarks: string
  ) =>
    apiRequest<FoodProvider>(`/api/admin/providers/${providerId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks }),
    }),
  listNgos: () => apiRequest<NGO[]>('/api/admin/ngos'),
  verifyNgo: (ngoId: string, status: VerificationStatus, remarks: string) =>
    apiRequest<NGO>(`/api/admin/ngos/${ngoId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks }),
    }),
  listUsers: () => apiRequest<User[]>('/api/admin/users'),
  listComplaints: () => apiRequest<Complaint[]>('/api/admin/complaints'),
  resolveComplaint: (complaintId: string, status: Complaint['status'], adminResponse: string) =>
    apiRequest<Complaint>(`/api/admin/complaints/${complaintId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status, adminResponse }),
    }),
  listAuditLogs: () => apiRequest<AuditLog[]>('/api/admin/audit-logs'),
};
