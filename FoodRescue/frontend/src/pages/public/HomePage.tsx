import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SafeImage } from '../../components/common/SafeImage';
import { useApp } from '../../contexts/AppContext';

const HERO_IMG = '/src/assets/images/hero_food_rescue_1795680633884.jpg';

const FEATURES = [
  {
    num: '01',
    title: 'Smart Food Surplus Prediction',
    desc: 'Estimates daily leftover meals per provider using historical prepared, sold, and weekday/weekend patterns before closing hours.',
    icon: <Sparkles className="w-5 h-5 text-[#14532D]" />,
  },
  {
    num: '02',
    title: 'Verified Food Providers',
    desc: 'Hotels, hostels, mess halls, bakeries, and canteens undergo FSSAI license and document review by platform administrators.',
    icon: <ShieldCheck className="w-5 h-5 text-[#14532D]" />,
  },
  {
    num: '03',
    title: 'Intelligent NGO Allocation',
    desc: 'Splits confirmed surplus across multiple verified NGOs based on proximity, transport, beneficiary need, and safe-use deadlines.',
    icon: <HeartHandshake className="w-5 h-5 text-[#14532D]" />,
  },
  {
    num: '04',
    title: 'Real-Time Donation Tracking',
    desc: 'Follow every batch from prediction and provider confirmation through scheduled pickup, collection, and distribution confirmation.',
    icon: <Truck className="w-5 h-5 text-[#14532D]" />,
  },
  {
    num: '05',
    title: 'Food Rescue Analytics',
    desc: 'Track prediction accuracy, confirmed versus allocated meals, unclaimed batches, and participating kitchens with interactive charts.',
    icon: <TrendingUp className="w-5 h-5 text-[#14532D]" />,
  },
  {
    num: '06',
    title: 'Community Impact',
    desc: 'Coordinate timely redistribution to shelters and community kitchens while distinguishing measured collections from estimated reach.',
    icon: <ClipboardCheck className="w-5 h-5 text-[#14532D]" />,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Before FoodRescue, evening banquet leftovers were estimated manually too late for pickup. Now the 7:30 PM prompt helps our kitchen confirm exact tray counts, cutting uncollected surplus across three weekly events.',
    name: 'Arjun Menon',
    role: 'Executive Banquet Manager',
    org: 'Grand Horizon Hotel & Banquets',
  },
  {
    quote:
      'Partial multi-NGO allocation changed how we operate. When a hotel confirms 100 meals, our van collects 40 meals matching our shelter capacity while partner NGOs receive the remaining 60.',
    name: 'Meera Krishnan',
    role: 'Operations Coordinator',
    org: 'HopeBridge Foundation',
  },
];

const FAQS = [
  {
    q: 'Are predicted surplus meals automatically offered to NGOs?',
    a: 'No. A prediction is only a statistical estimate. Food providers must explicitly confirm full, partial, or custom quantities (or create a voluntary donation) before any record becomes visible to NGOs.',
  },
  {
    q: 'How does multi-NGO allocation split a single donation?',
    a: 'If a provider confirms 100 meals, the allocation engine ranks nearby verified NGOs by accepted categories, capacity, transport readiness, and remaining safe-use time—for example assigning 40, 35, and 25 meals without ever exceeding 100.',
  },
  {
    q: 'Can administrator accounts be registered publicly?',
    a: 'No. Administrator access is restricted and cannot be self-registered publicly. Only authorized system administrators verify providers, review NGOs, and audit allocations.',
  },
  {
    q: 'Does FoodRescue certify food safety?',
    a: 'FoodRescue records preparation times, storage details, safe-use deadlines, and provider safety declarations to support informed decisions, but responsibility for food handling remains with providers and collecting NGOs.',
  },
];

export function HomePage() {
  const { demoMode, loginDemoRole, donations, providers, ngos } = useApp();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const completedMealsDemo = donations.reduce((sum, d) => sum + d.confirmedQuantity, 0);

  const handleLaunchDemo = (role: 'PROVIDER' | 'NGO' | 'ADMIN') => {
    loginDemoRole(role);
    navigate(
      role === 'PROVIDER'
        ? '/provider/dashboard'
        : role === 'NGO'
        ? '/ngo/dashboard'
        : '/admin/dashboard'
    );
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="border-b border-[#E2E8E4] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
                FoodRescue · Smart Food. Shared Hope.
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1C2520] leading-[1.12] text-balance">
                Turning Surplus Food Into Hope.
              </h1>
              <p className="text-base sm:text-lg text-[#4A5950] leading-relaxed max-w-xl">
                An intelligent food rescue platform connecting food providers with verified NGOs to
                reduce food wastage and deliver surplus meals to communities in need.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/register/provider"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0F4022] transition-colors whitespace-nowrap shrink-0"
                >
                  Register as Food Provider
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register/ngo"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#C2410C] transition-colors whitespace-nowrap shrink-0"
                >
                  Register as NGO
                </Link>
              </div>
              <p className="text-xs text-[#4A5950]">
                Predict Surplus · Confirm Availability · Allocate Intelligently · Track Collection
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] overflow-hidden rounded-xl border border-[#E2E8E4] bg-[#F2F6F3]">
                <SafeImage
                  src={HERO_IMG}
                  alt="Hospitality chefs and food rescue volunteers packing surplus meals in stainless steel containers"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Impact Metrics Strip (Explicitly Labeled Demo Data) */}
          <div className="mt-12 pt-8 border-t border-[#E2E8E4]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-sm font-semibold text-[#1C2520]">
                Platform Snapshot {demoMode ? '(DEMO DATA)' : ''}
              </h2>
              <span className="text-xs text-[#4A5950]">
                {demoMode
                  ? 'Sample demonstration records shown until connected to MySQL foodrescue_db'
                  : 'Measured records from Spring Boot backend'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-[#E2E8E4] bg-[#FAFBF9] p-4">
                <p className="text-xs text-[#4A5950]">Active Meals in Demo Cycle</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[#14532D] tabular-nums">
                  {completedMealsDemo}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8E4] bg-[#FAFBF9] p-4">
                <p className="text-xs text-[#4A5950]">Registered Food Providers</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[#1C2520] tabular-nums">
                  {providers.length}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8E4] bg-[#FAFBF9] p-4">
                <p className="text-xs text-[#4A5950]">Participating NGOs</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[#1C2520] tabular-nums">
                  {ngos.length}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8E4] bg-[#FAFBF9] p-4">
                <p className="text-xs text-[#4A5950]">Multi-NGO Allocation Match</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[#EA580C] tabular-nums">
                  40 + 35 + 25
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Portal Launcher */}
      {demoMode && (
        <section className="border-b border-[#E2E8E4] bg-[#F2F6F3]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1 max-w-2xl">
              <p className="text-xs font-semibold text-[#EA580C]">
                DEMO MODE · INTERACTIVE PORTAL PREVIEW
              </p>
              <h2 className="font-display text-xl font-bold text-[#1C2520]">
                Explore all three role-based portals immediately
              </h2>
              <p className="text-sm text-[#4A5950]">
                Test the 12-step rescue workflow: record hotel inventory, confirm the 50-meal
                surplus prediction, run multi-NGO allocation, accept pickup, and monitor audit logs.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleLaunchDemo('PROVIDER')}
                className="rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0F4022] transition-colors whitespace-nowrap"
              >
                Open Provider Portal
              </button>
              <button
                type="button"
                onClick={() => handleLaunchDemo('NGO')}
                className="rounded-lg bg-[#EA580C] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#C2410C] transition-colors whitespace-nowrap"
              >
                Open NGO Portal
              </button>
              <button
                type="button"
                onClick={() => handleLaunchDemo('ADMIN')}
                className="rounded-lg border border-[#14532D] bg-white px-4 py-2.5 text-sm font-medium text-[#14532D] hover:bg-[#FAFBF9] transition-colors whitespace-nowrap"
              >
                Open Admin Portal
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Platform Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#1C2520] text-balance">
            Built for accountable surplus prediction and coordinated rescue
          </h2>
          <p className="mt-2 text-base text-[#4A5950]">
            Every module enforces verification, food safety windows, and human confirmation before
            allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.num}
              className="rounded-xl border border-[#E2E8E4] bg-white p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-[#4A5950]">{f.num}.</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F2F6F3]">
                    {f.icon}
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-[#1C2520]">{f.title}</h3>
                <p className="mt-2 text-sm text-[#4A5950] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works & Role Explanations */}
      <section className="border-y border-[#E2E8E4] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#1C2520]">
                How FoodRescue Works
              </h2>
              <p className="mt-2 text-base text-[#4A5950]">
                Three disciplined stages connecting kitchens, verified NGOs, and governance.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="text-sm font-semibold text-[#14532D] hover:underline whitespace-nowrap"
            >
              View full role workflows →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="rounded-xl border border-[#E2E8E4] bg-[#FAFBF9] p-6">
              <p className="font-mono text-xs font-semibold text-[#EA580C]">STEP 01</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#1C2520]">
                Record Daily Inventory
              </h3>
              <p className="mt-2 text-sm text-[#4A5950] leading-relaxed">
                Food providers record prepared, sold, and remaining quantities with preparation times
                and safe-use deadlines.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8E4] bg-[#FAFBF9] p-6">
              <p className="font-mono text-xs font-semibold text-[#EA580C]">STEP 02</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#1C2520]">
                Predict & Confirm Surplus
              </h3>
              <p className="mt-2 text-sm text-[#4A5950] leading-relaxed">
                The system forecasts expected surplus and requests provider confirmation around 7–8
                PM. Unconfirmed predictions are never shared.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8E4] bg-[#FAFBF9] p-6">
              <p className="font-mono text-xs font-semibold text-[#EA580C]">STEP 03</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#1C2520]">
                Allocate & Track Pickup
              </h3>
              <p className="mt-2 text-sm text-[#4A5950] leading-relaxed">
                Confirmed food is intelligently split among suitable NGOs for scheduled pickup,
                collection confirmation, and community distribution.
              </p>
            </div>
          </div>

          {/* Separate Role Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#E2E8E4]">
            <div>
              <h3 className="font-display text-base font-semibold text-[#14532D]">
                For Food Providers
              </h3>
              <p className="mt-1.5 text-sm text-[#4A5950] leading-relaxed">
                Log daily batches, review statistical surplus predictions, confirm exact meal counts
                or donate anytime, and coordinate gate pickup via chat.
              </p>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-[#14532D]">
                For Verified NGOs
              </h3>
              <p className="mt-1.5 text-sm text-[#4A5950] leading-relaxed">
                Receive matched allocations sized to beneficiary requirements and transport
                capacity, accept full or partial batches, and log final distribution.
              </p>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-[#14532D]">
                For Administrators
              </h3>
              <p className="mt-1.5 text-sm text-[#4A5950] leading-relaxed">
                Verify FSSAI licenses and NGO registrations, intervene on unclaimed donations,
                resolve support tickets, and review immutable audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Sample Content Labeled Clearly) & FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#4A5950]">
                SAMPLE CASE STORIES · DEMO CONTENT
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#1C2520]">
                Designed with kitchens and NGOs in mind
              </h2>
            </div>
            <div className="space-y-4">
              {TESTIMONIALS.map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-4"
                >
                  <p className="text-sm text-[#1C2520] leading-relaxed">“{t.quote}”</p>
                  <footer className="text-xs text-[#4A5950]">
                    <span className="font-semibold text-[#1C2520]">{t.name}</span> · {t.role} ·{' '}
                    {t.org}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#4A5950]">FREQUENTLY ASKED QUESTIONS</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#1C2520]">
                Platform rules & safeguards
              </h2>
            </div>
            <div className="divide-y divide-[#E2E8E4] rounded-xl border border-[#E2E8E4] bg-white">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="p-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="text-sm font-semibold text-[#1C2520]">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#4A5950] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#4A5950] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-sm text-[#4A5950] leading-relaxed">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
