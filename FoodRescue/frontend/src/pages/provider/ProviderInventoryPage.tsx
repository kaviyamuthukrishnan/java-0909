import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useApp } from '../../contexts/AppContext';
import { FoodCategory, InventoryRecord } from '../../types';
import { FOOD_CATEGORY_LABELS, formatDateTime } from '../../utils/formatters';

export function ProviderInventoryPage() {
  const {
    currentUser,
    inventory,
    addInventoryRecord,
    updateInventoryRecord,
    deleteInventoryRecord,
    recalculatePrediction,
  } = useApp();
  const navigate = useNavigate();

  const providerId = currentUser?.organizationId || 'prov-1';
  const myRecords = inventory.filter((r) => r.providerId === providerId);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'REMAINING_DESC' | 'PREPARED_DESC'>('DATE_DESC');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null);

  const [foodItemName, setFoodItemName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('COOKED_MEALS');
  const [quantityPrepared, setQuantityPrepared] = useState(120);
  const [quantitySold, setQuantitySold] = useState(90);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [preparationTime, setPreparationTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [storageInfo, setStorageInfo] = useState('Insulated stainless steel cambro at 65°C');
  const [safeUseDeadline, setSafeUseDeadline] = useState(
    new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState('');

  const filtered = useMemo(() => {
    return myRecords
      .filter((r) => {
        const matchesSearch =
          r.foodItemName.toLowerCase().includes(search.toLowerCase()) ||
          (r.notes || '').toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'REMAINING_DESC') return b.remainingQuantity - a.remainingQuantity;
        if (sortBy === 'PREPARED_DESC') return b.quantityPrepared - a.quantityPrepared;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [myRecords, search, categoryFilter, sortBy]);

  const openAddModal = () => {
    setEditingRecord(null);
    setFoodItemName('');
    setCategory('COOKED_MEALS');
    setQuantityPrepared(100);
    setQuantitySold(75);
    setDate(new Date().toISOString().slice(0, 10));
    setPreparationTime(new Date().toISOString().slice(0, 16));
    setStorageInfo('Insulated stainless steel cambro at 65°C');
    setSafeUseDeadline(new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 16));
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (record: InventoryRecord) => {
    setEditingRecord(record);
    setFoodItemName(record.foodItemName);
    setCategory(record.category);
    setQuantityPrepared(record.quantityPrepared);
    setQuantitySold(record.quantitySold);
    setDate(record.date);
    setPreparationTime(record.preparationTime.slice(0, 16));
    setStorageInfo(record.storageInfo);
    setSafeUseDeadline(record.safeUseDeadline.slice(0, 16));
    setNotes(record.notes || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = Math.max(0, quantityPrepared - quantitySold);
    if (editingRecord) {
      updateInventoryRecord(editingRecord.id, {
        foodItemName,
        category,
        quantityPrepared,
        quantitySold,
        remainingQuantity: remaining,
        date,
        preparationTime: new Date(preparationTime).toISOString(),
        storageInfo,
        safeUseDeadline: new Date(safeUseDeadline).toISOString(),
        notes,
      });
    } else {
      addInventoryRecord({
        providerId,
        foodItemName,
        category,
        quantityPrepared,
        quantitySold,
        remainingQuantity: remaining,
        date,
        preparationTime: new Date(preparationTime).toISOString(),
        storageInfo,
        safeUseDeadline: new Date(safeUseDeadline).toISOString(),
        notes,
      });
    }
    setModalOpen(false);
  };

  const handleRunPrediction = () => {
    recalculatePrediction(providerId);
    navigate('/provider/prediction');
  };

  return (
    <PortalLayout breadcrumb="Food Inventory Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1C2520]">
              Daily Food Inventory
            </h1>
            <p className="mt-1 text-sm text-[#4A5950]">
              Record prepared, sold, and remaining food batches with preparation times and safe-use
              deadlines.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRunPrediction}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#14532D] bg-white px-3.5 py-2 text-sm font-medium text-[#14532D] hover:bg-[#F2F6F3] whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Recalculate Surplus Prediction
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F4022] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Record Food Batch
            </button>
          </div>
        </div>

        {/* Search, Filter, Sort Toolbar */}
        <div className="rounded-xl border border-[#E2E8E4] bg-white p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4A5950] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food item or notes..."
              className="w-full rounded-lg border border-[#D3DDD6] pl-9 pr-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white focus:border-[#14532D] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {FOOD_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm bg-white focus:border-[#14532D] focus:outline-none"
          >
            <option value="DATE_DESC">Sort: Latest First</option>
            <option value="REMAINING_DESC">Sort: Highest Remaining</option>
            <option value="PREPARED_DESC">Sort: Highest Prepared</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No inventory records match your filter"
            description="Record today's prepared and sold meals so the surplus prediction engine can estimate leftovers accurately."
            actionLabel="Record First Batch"
            onAction={openAddModal}
          />
        ) : (
          <div className="rounded-xl border border-[#E2E8E4] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8E4] bg-[#FAFBF9] text-xs font-semibold text-[#4A5950]">
                    <th className="px-4 py-3">Food Item</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Prepared</th>
                    <th className="px-4 py-3 text-right">Sold</th>
                    <th className="px-4 py-3 text-right">Remaining</th>
                    <th className="px-4 py-3">Safe-Use Deadline</th>
                    <th className="px-4 py-3">Storage</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E4] text-sm">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAFBF9]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1C2520]">{item.foodItemName}</p>
                        {item.notes && <p className="text-xs text-[#4A5950]">{item.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#4A5950]">
                        {FOOD_CATEGORY_LABELS[item.category]}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {item.quantityPrepared}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {item.quantitySold}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#EA580C] tabular-nums">
                        {item.remainingQuantity}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[#4A5950]">
                        {formatDateTime(item.safeUseDeadline)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#4A5950] max-w-xs truncate">
                        {item.storageInfo}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          aria-label={`Edit ${item.foodItemName}`}
                          className="rounded p-1.5 text-[#4A5950] hover:bg-[#F2F6F3] hover:text-[#14532D]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInventoryRecord(item.id)}
                          aria-label={`Delete ${item.foodItemName}`}
                          className="rounded p-1.5 text-[#4A5950] hover:bg-red-50 hover:text-red-700 ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? 'Update Inventory Batch' : 'Record Food Inventory Batch'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">
              Food Item Name *
            </label>
            <input
              type="text"
              required
              value={foodItemName}
              onChange={(e) => setFoodItemName(e.target.value)}
              placeholder="e.g., Vegetable Pulao & Dal Fry"
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm focus:border-[#14532D] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-medium text-[#1C2520] mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Prepared (Meals) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantityPrepared}
                onChange={(e) => setQuantityPrepared(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Sold (Meals) *
              </label>
              <input
                type="number"
                min={0}
                max={quantityPrepared}
                required
                value={quantitySold}
                onChange={(e) => setQuantitySold(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">Remaining</label>
              <div className="rounded-lg border border-[#E2E8E4] bg-[#FAFBF9] px-3 py-2 text-sm font-mono font-bold text-[#EA580C]">
                {Math.max(0, quantityPrepared - quantitySold)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1C2520] mb-1">
                Preparation Time *
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
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">
              Food Storage Details *
            </label>
            <input
              type="text"
              required
              value={storageInfo}
              onChange={(e) => setStorageInfo(e.target.value)}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1C2520] mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-[#D3DDD6] px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-[#D3DDD6] px-4 py-2 text-sm font-medium text-[#1C2520]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#14532D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0F4022]"
            >
              {editingRecord ? 'Update Batch' : 'Save Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </PortalLayout>
  );
}
