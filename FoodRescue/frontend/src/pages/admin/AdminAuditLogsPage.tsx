import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { formatDateTime } from '../../utils/formatters';

export function AdminAuditLogsPage() {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout breadcrumb="Audit Logs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">System Audit Logs</h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Chronological trail of approvals, allocation decisions, and account changes.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#4A5950] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter logs..."
              className="w-full rounded-lg border border-[#D3DDD6] bg-white pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E4] bg-[#FAFBF9] text-xs font-semibold text-[#4A5950]">
                  <th className="px-4 py-3">Log ID</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E4] text-sm">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFBF9]">
                    <td className="px-4 py-3 font-mono text-xs text-[#4A5950]">{log.id}</td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold text-[#1C2520]">{log.actorName}</p>
                      <p className="text-[#4A5950] font-mono">{log.actorRole}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#14532D]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#4A5950]">
                      {log.entityType} · {log.entityId}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#1C2520]">{log.details}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#4A5950] whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
