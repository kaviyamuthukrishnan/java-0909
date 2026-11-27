import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { Complaint } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export function AdminComplaintsPage() {
  const { complaints, resolveComplaint } = useApp();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [nextStatus, setNextStatus] = useState<Complaint['status']>('RESOLVED');
  const [responseText, setResponseText] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    resolveComplaint(selected.id, nextStatus, responseText);
    setSelected(null);
  };

  return (
    <PortalLayout breadcrumb="Complaints & Support">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C2520]">
            Complaints & Support Desk
          </h1>
          <p className="mt-1 text-sm text-[#4A5950]">
            Investigate pickup delays, quantity mismatches, and communication escalations.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E4] bg-[#FAFBF9] text-xs font-semibold text-[#4A5950]">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Reported By</th>
                  <th className="px-4 py-3">Donation</th>
                  <th className="px-4 py-3">Category & Details</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E4] text-sm">
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold">{c.id}</td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold text-[#1C2520]">{c.reportedByName}</p>
                      <p className="text-[#4A5950]">{c.reportedByRole}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#14532D]">
                      {c.relatedDonationId}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-md">
                      <p className="font-semibold text-[#1C2520]">
                        {c.category.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[#4A5950]">{c.description}</p>
                      {c.adminResponse && (
                        <p className="mt-1 text-[#14532D]">
                          <strong>Admin Response:</strong> {c.adminResponse}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#4A5950]">
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(c);
                          setNextStatus(c.status === 'OPEN' ? 'INVESTIGATING' : 'RESOLVED');
                          setResponseText(c.adminResponse || '');
                        }}
                        className="rounded-md border border-[#14532D] px-3 py-1.5 text-xs font-semibold text-[#14532D] hover:bg-[#F2F6F3]"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Resolve ${selected.id}` : ''}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">Status</label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as Complaint['status'])}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white"
            >
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">
              Administrator Response *
            </label>
            <textarea
              rows={3}
              required
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white"
            >
              Update Ticket
            </button>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
