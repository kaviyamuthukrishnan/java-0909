import React, { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { chatService } from '../../services/chatService';
import { Message } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export function CommunicationCenterPage() {
  const { currentUser, donations, allocations, messages, sendChatMessage, users } = useApp();
  const connInfo = chatService.getConnectionInfo();

  const relevantDonations = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return donations;
    if (currentUser.role === 'PROVIDER') {
      return donations.filter((d) => d.providerId === (currentUser.organizationId || 'prov-1'));
    }
    const ngoAllocIds = new Set(
      allocations
        .filter((a) => a.ngoId === (currentUser.organizationId || 'ngo-1'))
        .map((a) => a.donationId)
    );
    return donations.filter((d) => ngoAllocIds.has(d.id));
  }, [currentUser, donations, allocations]);

  const [selectedDonationId, setSelectedDonationId] = useState<string>(
    relevantDonations[0]?.id || 'DON-2026-101'
  );
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<Message['messageType']>('CHAT');

  const thread = messages.filter((m) => m.donationId === selectedDonationId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;
    const donation = donations.find((d) => d.id === selectedDonationId);
    const receiver =
      currentUser.role === 'PROVIDER'
        ? users.find((u) => u.role === 'NGO')
        : users.find((u) => u.organizationId === donation?.providerId) ||
          users.find((u) => u.role === 'PROVIDER');

    sendChatMessage(
      selectedDonationId,
      receiver?.id || 'usr-ngo-1',
      receiver?.organizationName || receiver?.name || 'Partner',
      content,
      messageType
    );
    setContent('');
  };

  return (
    <PortalLayout breadcrumb="Donation Communication Center">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Provider & NGO Communication Center
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Negotiate collection times, share gate pickup instructions, and send delay alerts.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {connInfo.mode === 'DEMO_ADAPTER'
              ? `Demo Chat Adapter active (STOMP WebSocket ready at ${connInfo.wsEndpoint} when Spring Boot runs)`
              : `STOMP WebSocket target: ${connInfo.wsEndpoint}`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donation Threads Sidebar */}
          <div className="lg:col-span-4 rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
            <div className="border-b border-[#E2E8E4] px-4 py-3 bg-[#FAFBF9]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4A5950]">
                Donation Threads ({relevantDonations.length})
              </h2>
            </div>
            <div className="divide-y divide-[#E2E8E4]">
              {relevantDonations.map((d) => {
                const active = d.id === selectedDonationId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDonationId(d.id)}
                    className={`w-full text-left px-4 py-3.5 transition-colors ${
                      active ? 'bg-[#F2F6F3]' : 'hover:bg-[#FAFBF9]'
                    }`}
                  >
                    <p className="font-mono text-xs font-bold text-[#14532D]">{d.id}</p>
                    <p className="mt-0.5 text-sm font-medium text-[#1C2520] truncate">
                      {d.foodName}
                    </p>
                    <p className="text-xs text-[#4A5950]">{d.providerName}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Thread */}
          <div className="lg:col-span-8 rounded-xl border border-[#E2E8E4] bg-white flex flex-col min-h-[460px]">
            <div className="border-b border-[#E2E8E4] px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1C2520]">
                  Thread: <span className="font-mono">{selectedDonationId}</span>
                </p>
                <p className="text-xs text-[#4A5950]">
                  Donation-scoped message history with read status
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#FAFBF9]">
              {thread.length === 0 ? (
                <p className="text-center text-xs text-[#4A5950] py-12">
                  No messages yet for this donation. Send pickup instructions or ETA updates below.
                </p>
              ) : (
                thread.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-lg rounded-xl border px-4 py-3 text-sm ${
                          isMine
                            ? 'bg-[#14532D] text-white border-[#14532D]'
                            : 'bg-white text-[#1C2520] border-[#E2E8E4]'
                        }`}
                      >
                        <p className="text-[11px] font-semibold opacity-80 mb-1">
                          {msg.senderName} · {msg.messageType.replace(/_/g, ' ')}
                        </p>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className="mt-1.5 text-[10px] font-mono opacity-75">
                          {formatDateTime(msg.createdAt)} · {msg.isRead ? 'Read' : 'Sent'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="border-t border-[#E2E8E4] p-4 bg-white space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as Message['messageType'])}
                  className="rounded-lg border border-[#D3DDD6] px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="CHAT">General Message</option>
                  <option value="TIME_NEGOTIATION">Collection Time Negotiation</option>
                  <option value="PICKUP_INSTRUCTIONS">Pickup Instructions</option>
                  <option value="QUANTITY_UPDATE">Quantity Update</option>
                  <option value="DELAY_ALERT">Delay Notification</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setContent('Arriving at Service Gate B within 15 minutes with insulated crates.')
                  }
                  className="rounded-md border border-[#E2E8E4] bg-[#FAFBF9] px-2.5 py-1 text-xs text-[#4A5950] hover:text-[#14532D]"
                >
                  Insert ETA template
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write a message about pickup timing, gate access, or quantity..."
                  className="flex-1 rounded-lg border border-[#D3DDD6] px-3.5 py-2 text-sm focus:border-[#14532D] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F4022]"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
