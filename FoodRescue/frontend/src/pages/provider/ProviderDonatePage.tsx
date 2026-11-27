import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { FoodCategory } from '../../types';
import { FOOD_CATEGORY_LABELS } from '../../utils/formatters';

export function ProviderDonatePage() {
  const { currentUser, providers, createVoluntaryDonation, runIntelligentAllocation } = useApp();
  const navigate = useNavigate();

  const providerId = currentUser?.organizationId || 'prov-1';
  const provider = providers.find((p) => p.id === providerId) || providers[0];

  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('COOKED_MEALS');
  const [estimatedMeals, setEstimatedMeals] = useState(50);
  const [preparationTime, setPreparationTime] = useState(
    new Date(Date.now() - 3600000).toISOString().slice(0, 16)
  );
  const [readyForPickupTime, setReadyForPickupTime] = useState(
    new Date(Date.now() + 1800000).toISOString().slice(0, 16)
  );
  const [safeUseDeadline, setSafeUseDeadline] = useState(
    new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 16)
  );
  const [storageDetails, setStorageDetails] = useState(
    'Hot-held in sealed food-grade stainless steel containers'
  );
  const [allergenInfo, setAllergenInfo] = useState('Vegetarian · Contains dairy/wheat');
  const [pickupAddress, setPickupAddress] = useState(
    provider ? `${provider.address}, ${provider.city} ${provider.postalCode}` : ''
  );
  const [handlingInstructions, setHandlingInstructions] = useState('');
  const [autoAllocate, setAutoAllocate] = useState(true);
  const [safetyDeclared, setSafetyDeclared] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyDeclared) return;

    const donation = createVoluntaryDonation({
      providerId,
      foodName,
      category,
      estimatedMeals,
      preparationTime: new Date(preparationTime).toISOString(),
      readyForPickupTime: new Date(readyForPickupTime).toISOString(),
      safeUseDeadline: new Date(safeUseDeadline).toISOString(),
      storageDetails,
      allergenInfo,
      pickupAddress,
      handlingInstructions,
    });

    if (autoAllocate) {
      runIntelligentAllocation(donation.id);
    }
    navigate('/provider/donations');
  };

  return (
    <PortalLayout breadcrumb="Donate Food (Voluntary)">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C2520]">
            Voluntary Food Donation
          </h1>
          <p className="mt-1 text-sm text-[#4A5950]">
            Donate surplus food at any time—you do not need to wait for the evening prediction
            prompt.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#E2E8E4] bg-white p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Food Name / Batch Description *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., Banquet Veg Pulao, Paneer Curry & Phulkas"
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white"
              >
                {(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {FOOD_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Estimated Meals Available *
              </label>
              <input
                type="number"
                min={5}
                required
                value={estimatedMeals}
                onChange={(e) => setEstimatedMeals(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Preparation Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Ready for Pickup Time *
              </label>
              <input
                type="datetime-local"
                required
                value={readyForPickupTime}
                onChange={(e) => setReadyForPickupTime(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Safe-Use Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={safeUseDeadline}
                onChange={(e) => setSafeUseDeadline(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Allergen Information
              </label>
              <input
                type="text"
                value={allergenInfo}
                onChange={(e) => setAllergenInfo(e.target.value)}
                placeholder="Dairy, nuts, gluten, etc."
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Storage & Packaging Details *
              </label>
              <input
                type="text"
                required
                value={storageDetails}
                onChange={(e) => setStorageDetails(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Pickup Address *
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Additional Gate / Handling Instructions
              </label>
              <textarea
                rows={2}
                value={handlingInstructions}
                onChange={(e) => setHandlingInstructions(e.target.value)}
                placeholder="e.g., Ask security for Service Gate B; bring insulated crates."
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-[#E2E8E4] pt-4">
            <label className="flex items-start gap-2.5 text-xs text-[#1C2520] cursor-pointer">
              <input
                type="checkbox"
                checked={autoAllocate}
                onChange={(e) => setAutoAllocate(e.target.checked)}
                className="mt-0.5 accent-[#14532D]"
              />
              <span>
                Immediately run <strong>Intelligent Multi-NGO Allocation</strong> after creating this
                confirmed donation
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-[#1C2520] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={safetyDeclared}
                onChange={(e) => setSafetyDeclared(e.target.checked)}
                className="mt-0.5 accent-[#14532D]"
              />
              <span>
                <strong>Provider Food Safety Declaration:</strong> I confirm this food was prepared
                hygienically, stored within safe temperature limits, and has not been previously
                served.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#C2410C]"
            >
              {autoAllocate ? <Sparkles className="w-4 h-4" /> : <UtensilsCrossed className="w-4 h-4" />}
              Confirm & Publish Donation
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
