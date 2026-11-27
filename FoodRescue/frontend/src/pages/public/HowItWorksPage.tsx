import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';

const WORKFLOW_BY_ROLE = [
  {
    role: 'Food Provider Workflow',
    accent: 'text-[#14532D]',
    steps: [
      'Register organization and upload FSSAI license for administrator approval.',
      'Record daily prepared, sold, and remaining food inventory with safe-use deadlines.',
      'Review statistical surplus prediction and respond to the 7–8 PM confirmation prompt (Full, Partial, Custom, Decline, or Remind Later).',
      'Optionally submit a voluntary donation anytime using the Donate Food button.',
      'Coordinate pickup gate timing with assigned NGOs via donation chat and track completion.',
    ],
  },
  {
    role: 'NGO Workflow',
    accent: 'text-[#EA580C]',
    steps: [
      'Register NGO profile with registration documents, service zones, capacity, and transport details.',
      'Browse only confirmed, non-expired donations or view Intelligent Allocation recommendations.',
      'Accept full or partial meal allocations, choose transport mode, and confirm pickup time.',
      'Mark food collected on-site, report delays if traffic occurs, and confirm community distribution.',
      'Submit food quality and punctuality feedback to strengthen provider trust.',
    ],
  },
  {
    role: 'Administrator Workflow',
    accent: 'text-[#1C2520]',
    steps: [
      'Review pending provider FSSAI licenses and NGO registration documents (Approve, Reject, or Request Correction).',
      'Monitor live donations, remaining unallocated quantities, and approaching safe-use deadlines.',
      'Run or manually override multi-NGO allocations when special logistical intervention is needed.',
      'Investigate complaints and collection delays between kitchens and NGOs.',
      'Audit all system decisions and export platform-wide rescue metrics.',
    ],
  },
];

export function HowItWorksPage() {
  return (
    <PublicLayout>
      <section className="border-b border-[#E2E8E4] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
            System Workflow
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C2520]">
            End-to-End Rescue Lifecycle
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#4A5950]">
            From kitchen inventory logging to multi-NGO split allocation and verified delivery.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            {[
              '1. Prediction',
              '2. Confirmation',
              '3. Donation',
              '4. Allocation',
              '5. Acceptance',
              '6. Scheduling',
              '7. Collection',
              '8. Distribution',
              '9. Completed',
            ].map((stage) => (
              <div
                key={stage}
                className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] px-3 py-3 text-center text-xs font-semibold text-[#1C2520]"
              >
                {stage}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {WORKFLOW_BY_ROLE.map((block) => (
            <div
              key={block.role}
              className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4"
            >
              <h2 className={`font-display text-xl font-bold ${block.accent}`}>{block.role}</h2>
              <ol className="space-y-3">
                {block.steps.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[#4A5950]">
                    <CheckCircle2 className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Multi-NGO Split Visual Example */}
        <div className="rounded-xl border border-[#E2E8E4] bg-white p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-[#EA580C]">
                INTELLIGENT ALLOCATION EXAMPLE
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#1C2520]">
                How 100 confirmed hotel meals are split across 3 NGOs
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F4022] whitespace-nowrap"
            >
              Try Live Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-4">
              <p className="text-xs text-[#4A5950]">NGO A · HopeBridge Foundation</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#14532D] tabular-nums">
                40 Meals
              </p>
              <p className="mt-1 text-xs text-[#4A5950]">
                2.1 km away · Insulated Van · Accepts Cooked Meals
              </p>
            </div>
            <div className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-4">
              <p className="text-xs text-[#4A5950]">NGO B · Seva Anna Kitchen</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#14532D] tabular-nums">
                35 Meals
              </p>
              <p className="mt-1 text-xs text-[#4A5950]">
                2.7 km away · Electric Cargo Trike · 35-meal daily need
              </p>
            </div>
            <div className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] p-4">
              <p className="text-xs text-[#4A5950]">NGO C · NourishCare Shelter</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#14532D] tabular-nums">
                25 Meals
              </p>
              <p className="mt-1 text-xs text-[#4A5950]">
                4.0 km away · Two-Wheeler Carriers · Completes 100/100
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
