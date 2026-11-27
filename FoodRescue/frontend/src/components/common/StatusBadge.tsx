import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Truck,
  XCircle,
} from 'lucide-react';

type BadgeTone = 'green' | 'amber' | 'red' | 'slate' | 'orange';

const STATUS_CONFIG: Record<string, { label: string; tone: BadgeTone }> = {
  APPROVED: { label: 'Approved', tone: 'green' },
  ACTIVE: { label: 'Active', tone: 'green' },
  COMPLETED: { label: 'Completed', tone: 'green' },
  DISTRIBUTED: { label: 'Distributed', tone: 'green' },
  COLLECTED: { label: 'Collected', tone: 'green' },
  ACCEPTED: { label: 'Accepted', tone: 'green' },
  RESOLVED: { label: 'Resolved', tone: 'green' },
  CONFIRMED_FULL: { label: 'Confirmed Full', tone: 'green' },
  CONFIRMED_PARTIAL: { label: 'Confirmed Partial', tone: 'green' },
  CONFIRMED_CUSTOM: { label: 'Confirmed Custom', tone: 'green' },
  FULLY_ALLOCATED: { label: 'Fully Allocated', tone: 'green' },

  PENDING_REVIEW: { label: 'Pending Review', tone: 'amber' },
  PENDING_VERIFICATION: { label: 'Pending Verification', tone: 'amber' },
  PENDING_ALLOCATION: { label: 'Pending Allocation', tone: 'amber' },
  PENDING: { label: 'Pending', tone: 'amber' },
  PARTIALLY_ALLOCATED: { label: 'Partially Allocated', tone: 'orange' },
  PICKUP_SCHEDULED: { label: 'Pickup Scheduled', tone: 'orange' },
  SCHEDULED: { label: 'Scheduled', tone: 'orange' },
  IN_TRANSIT: { label: 'In Transit', tone: 'orange' },
  INVESTIGATING: { label: 'Investigating', tone: 'amber' },
  CORRECTION_REQUIRED: { label: 'Correction Required', tone: 'orange' },
  REMIND_LATER: { label: 'Remind Later', tone: 'slate' },
  OPEN: { label: 'Open', tone: 'amber' },

  REJECTED: { label: 'Rejected', tone: 'red' },
  SUSPENDED: { label: 'Suspended', tone: 'red' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
  EXPIRED: { label: 'Expired', tone: 'red' },
  UNCLAIMED: { label: 'Unclaimed', tone: 'red' },
  DELAYED: { label: 'Delayed', tone: 'red' },
  ISSUE_REPORTED: { label: 'Issue Reported', tone: 'red' },
  DECLINED: { label: 'Declined', tone: 'slate' },
  NOT_SUBMITTED: { label: 'Not Submitted', tone: 'slate' },
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  orange: 'bg-orange-50 text-orange-800 border-orange-200',
  red: 'bg-red-50 text-red-800 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

function getToneIcon(tone: BadgeTone, status: string) {
  if (status.includes('PICKUP') || status === 'SCHEDULED' || status === 'IN_TRANSIT') {
    return <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
  }
  switch (tone) {
    case 'green':
      return <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    case 'amber':
      return <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    case 'orange':
      return <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    case 'red':
      return <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    default:
      return <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
  }
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, ' '),
    tone: 'slate' as BadgeTone,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${TONE_CLASSES[cfg.tone]}`}
    >
      {getToneIcon(cfg.tone, status)}
      <span>{cfg.label}</span>
    </span>
  );
}
