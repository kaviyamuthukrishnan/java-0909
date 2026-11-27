import React from 'react';
import { AlertTriangle, Clock, FileCheck2, ShieldAlert, Thermometer } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SafeImage } from '../../components/common/SafeImage';

const SAFETY_IMG = '/src/assets/images/safety_kitchen_inspection_1795680635779.jpg';

const SAFETY_PILLARS = [
  {
    icon: <Clock className="w-5 h-5 text-[#14532D]" />,
    title: 'Preparation Time Recording',
    desc: 'Every inventory and donation batch requires the exact preparation timestamp before it can be submitted for allocation.',
  },
  {
    icon: <Thermometer className="w-5 h-5 text-[#14532D]" />,
    title: 'Food Category & Storage Details',
    desc: 'Providers document whether food is hot-held, refrigerated, ambient bakery, or sealed dry staples along with allergen notes.',
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-[#EA580C]" />,
    title: 'Safe Collection Deadlines',
    desc: 'The allocation engine automatically blocks expired items and flags urgent pickup windows approaching their safe-use cutoff.',
  },
  {
    icon: <FileCheck2 className="w-5 h-5 text-[#14532D]" />,
    title: 'Provider Food-Safety Declaration',
    desc: 'Providers explicitly declare food suitability and hygiene storage compliance prior to confirming any surplus donation.',
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-[#14532D]" />,
    title: 'NGO Collection Responsibility',
    desc: 'Collecting NGOs inspect container seals, temperature, and transport conditions upon pickup before distributing to beneficiaries.',
  },
  {
    icon: <FileCheck2 className="w-5 h-5 text-[#14532D]" />,
    title: 'Administrative Monitoring',
    desc: 'Administrators verify FSSAI registrations, monitor delayed pickups, and review quality complaints reported by either party.',
  },
];

export function FoodSafetyPage() {
  return (
    <PublicLayout>
      <section className="border-b border-[#E2E8E4] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
              Food Safety & Accountability
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C2520] text-balance">
              Transparent handling records at every handoff
            </h1>
            <p className="text-base text-[#4A5950] leading-relaxed">
              FoodRescue embeds preparation timestamps, storage logs, allergen disclosures, and
              strict expiry locks into the donation workflow so NGOs can evaluate suitability before
              accepting a pickup.
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Important Notice:</strong> FoodRescue is a coordination and tracking platform.
              It does not independently inspect kitchens, test food batches, or guarantee food
              safety. Primary food safety responsibility rests with the preparing food provider and
              the collecting NGO under applicable local regulations.
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] overflow-hidden rounded-xl border border-[#E2E8E4]">
              <SafeImage
                src={SAFETY_IMG}
                alt="Clean kitchen prep counter with labeled stainless steel food containers and digital probe thermometer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFETY_PILLARS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F2F6F3]">
                {item.icon}
              </div>
              <h2 className="font-display text-lg font-semibold text-[#1C2520]">{item.title}</h2>
              <p className="text-sm text-[#4A5950] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
