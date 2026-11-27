import React, { useState } from 'react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { formatDateOnly } from '../../utils/formatters';

export function AdminUsersPage() {
  const { users, updateUserAccountStatus } = useApp();
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PROVIDER' | 'NGO' | 'ADMIN'>('ALL');

  const filtered = users.filter((u) => roleFilter === 'ALL' || u.role === roleFilter);

  return (
    <PortalLayout breadcrumb="User Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Account & Role Management
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Manage Food Providers, NGOs, and Administrator accounts.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-[#F2F6F3] p-1 self-start">
            {(['ALL', 'PROVIDER', 'NGO', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  roleFilter === r ? 'bg-white text-[#14532D] shadow-sm' : 'text-[#4A5950]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E4] bg-[#FAFBF9] text-xs font-semibold text-[#4A5950]">
                  <th className="px-4 py-3">User / Organization</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E4] text-sm">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAFBF9]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1C2520]">{u.name}</p>
                      <p className="text-xs text-[#4A5950]">
                        {u.organizationName || 'System Admin'} · {u.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-[#14532D]">
                      {u.role}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#4A5950]">
                      {formatDateOnly(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.verificationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.accountStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateUserAccountStatus(
                              u.id,
                              u.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
                            )
                          }
                          className={`rounded-md px-3 py-1.5 text-xs font-medium border ${
                            u.accountStatus === 'SUSPENDED'
                              ? 'border-[#14532D] text-[#14532D] hover:bg-[#F2F6F3]'
                              : 'border-red-200 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          {u.accountStatus === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
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
