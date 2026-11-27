import { Message, Notification } from '../types';
import { API_BASE_URL, apiRequest, isDemoMode } from './apiClient';

/**
 * Spring Boot Notification & STOMP WebSocket Chat Service
 * REST Endpoints:
 * GET  /api/notifications
 * POST /api/notifications/{id}/read
 * GET  /api/chat/donations/{donationId}
 * POST /api/chat/donations/{donationId}
 *
 * WebSocket STOMP Endpoint (when Spring Boot STOMP broker is online):
 * ws://localhost:8080/ws-foodrescue (topic: /topic/donations/{donationId})
 */
export const notificationService = {
  list: () => apiRequest<Notification[]>('/api/notifications'),
  markAsRead: (id: string) =>
    apiRequest<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
};

export const chatService = {
  getConnectionInfo: () => ({
    mode: isDemoMode() ? ('DEMO_ADAPTER' as const) : ('STOMP_READY' as const),
    wsEndpoint: `${API_BASE_URL.replace(/^http/, 'ws')}/ws-foodrescue`,
    topicPrefix: '/topic/donations/',
  }),
  listMessages: (donationId: string) =>
    apiRequest<Message[]>(`/api/chat/donations/${donationId}`),
  sendMessage: (
    donationId: string,
    payload: Pick<Message, 'receiverId' | 'content' | 'messageType'>
  ) =>
    apiRequest<Message>(`/api/chat/donations/${donationId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
