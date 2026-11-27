import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Layers, Server, Users } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SafeImage } from '../../components/common/SafeImage';

const ABOUT_IMG = '/src/assets/images/about_community_kitchen_1795680635398.jpg';

export function AboutPage() {
  return (
    <PublicLayout>
      <section className="border-b border-[#E2E8E4] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#14532D]">
              About FoodRescue
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C2520] text-balance">
              Bridging institutional food surplus with verified community demand
            </h1>
            <p className="text-base text-[#4A5950] leading-relaxed">
              Every day, hotels, hostels, college canteens, and bakeries prepare food in large
              batches where modest demand fluctuations leave untouched meals surplus at closing
              time. Meanwhile, neighborhood shelters and community kitchens often struggle with
              inconsistent meal supply.
            </p>
            <p className="text-base text-[#4A5950] leading-relaxed">
              FoodRescue was engineered as a structured social-impact technology platform—combining
              historical surplus prediction, human confirmation, and multi-NGO allocation to move
              safe food within tight collection deadlines.
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] overflow-hidden rounded-xl border border-[#E2E8E4]">
              <SafeImage
                src={ABOUT_IMG}
                alt="Community NGO volunteers organizing fresh produce and meal packs"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#14532D]">
              <Globe className="w-5 h-5" />
              <h2 className="font-display text-xl font-bold">SDG 2 – Zero Hunger</h2>
            </div>
            <p className="text-sm text-[#4A5950] leading-relaxed">
              By routing confirmed surplus meals directly to verified shelters, child welfare homes,
              and community kitchens, FoodRescue helps expand dependable meal access without waiting
              for slow manual phone trees.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8E4] bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#EA580C]">
              <Layers className="w-5 h-5" />
              <h2 className="font-display text-xl font-bold">
                SDG 12 – Responsible Consumption & Production
              </h2>
            </div>
            <p className="text-sm text-[#4A5950] leading-relaxed">
              Daily inventory tracking and prediction-versus-actual analytics give commercial
              kitchens visibility into over-preparation patterns so teams can both donate surplus
              and gradually reduce source waste.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8E4] bg-white p-8">
          <h2 className="font-display text-2xl font-bold text-[#1C2520] mb-6">
            Role of Technology & Enterprise Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Server className="w-5 h-5 text-[#14532D]" />
              <h3 className="font-semibold text-[#1C2520]">Java Spring Boot & MySQL Core</h3>
              <p className="text-sm text-[#4A5950] leading-relaxed">
                Designed around Spring Boot 3, Spring Security JWT roles, Spring Data JPA, and MySQL
                8 (foodrescue_db) for transactional allocation integrity.
              </p>
            </div>
            <div className="space-y-2">
              <Users className="w-5 h-5 text-[#14532D]" />
              <h3 className="font-semibold text-[#1C2520]">Multi-NGO Split Allocation</h3>
              <p className="text-sm text-[#4A5950] leading-relaxed">
                Prevents single-recipient bottlenecks by scoring proximity, transport availability,
                category compatibility, and beneficiary counts across multiple NGOs.
              </p>
            </div>
            <div className="space-y-2">
              <Globe className="w-5 h-5 text-[#14532D]" />
              <h3 className="font-semibold text-[#1C2520]">Expected Community Benefits</h3>
              <p className="text-sm text-[#4A5950] leading-relaxed">
                Clearer pickup accountability, auditable verification records, and reliable evening
                coordination between local hospitality businesses and charities.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#E2E8E4] flex flex-wrap gap-3">
            <Link
              to="/register/provider"
              className="rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4022]"
            >
              Join as Food Provider
            </Link>
            <Link
              to="/register/ngo"
              className="rounded-lg border border-[#D3DDD6] bg-white px-4 py-2.5 text-sm font-semibold text-[#1C2520] hover:bg-[#F2F6F3]"
            >
              Join as NGO Partner
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
