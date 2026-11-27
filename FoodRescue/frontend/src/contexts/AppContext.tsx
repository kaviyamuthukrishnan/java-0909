import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEMO_ALLOCATIONS,
  DEMO_AUDIT_LOGS,
  DEMO_COMPLAINTS,
  DEMO_DONATIONS,
  DEMO_FEEDBACK,
  DEMO_INVENTORY,
  DEMO_MESSAGES,
  DEMO_NGOS,
  DEMO_NOTIFICATIONS,
  DEMO_PICKUPS,
  DEMO_PREDICTIONS,
  DEMO_PROVIDERS,
  DEMO_USERS,
  DEMO_VERIFICATION_HISTORY,
  DEMO_WASTE_HISTORY,
} from '../data/demoData';
import {
  isDemoMode as checkDemoMode,
  setAccessToken,
  setRuntimeDemoMode,
} from '../services/apiClient';
import { authService } from '../services/authService';
import {
  AccountStatus,
  AuditLog,
  Complaint,
  Donation,
  DonationAllocation,
  FeedbackRecord,
  FoodCategory,
  FoodProvider,
  InventoryRecord,
  Message,
  NGO,
  Notification,
  PickupRecord,
  PredictionConfirmationStatus,
  ProviderDocument,
  SurplusPrediction,
  User,
  UserRole,
  VerificationRecord,
  VerificationStatus,
  WasteHistory,
} from '../types';
import { computeIntelligentAllocationPlan } from '../utils/allocationEngine';
import { calculateStatisticalPrediction } from '../utils/predictionEngine';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export interface DemoPendingVerification {
  organizationName: string;
  role: 'PROVIDER' | 'NGO';
  email: string;
  phone: string;
  otp: string;
  generatedAt: string;
}

interface AppContextValue {
  demoMode: boolean;
  toggleDemoMode: (enabled: boolean) => void;
  demoPendingVerification: DemoPendingVerification | null;
  setDemoPendingRegistration: (info: Omit<DemoPendingVerification, 'generatedAt'> | null) => void;
  resendDemoRegistrationOtp: (phoneOverride?: string) => string | null;
  currentUser: User | null;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  loginDemoRole: (role: UserRole, userId?: string) => User;
  logout: () => void;
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Domain datasets
  users: User[];
  providers: FoodProvider[];
  ngos: NGO[];
  inventory: InventoryRecord[];
  wasteHistory: WasteHistory[];
  predictions: SurplusPrediction[];
  donations: Donation[];
  allocations: DonationAllocation[];
  pickups: PickupRecord[];
  messages: Message[];
  notifications: Notification[];
  verificationHistory: VerificationRecord[];
  feedback: FeedbackRecord[];
  complaints: Complaint[];
  auditLogs: AuditLog[];

  // Actions — Provider
  addInventoryRecord: (record: Omit<InventoryRecord, 'id' | 'createdAt'>) => void;
  updateInventoryRecord: (id: string, updates: Partial<InventoryRecord>) => void;
  deleteInventoryRecord: (id: string) => void;
  recalculatePrediction: (providerId: string) => SurplusPrediction;
  confirmPredictionSurplus: (
    predictionId: string,
    status: PredictionConfirmationStatus,
    confirmedMeals?: number,
    notes?: string
  ) => Donation | null;
  createVoluntaryDonation: (payload: {
    providerId: string;
    foodName: string;
    category: FoodCategory;
    estimatedMeals: number;
    preparationTime: string;
    readyForPickupTime: string;
    safeUseDeadline: string;
    storageDetails: string;
    allergenInfo?: string;
    pickupAddress: string;
    handlingInstructions?: string;
  }) => Donation;
  updateProviderProfile: (providerId: string, updates: Partial<FoodProvider>) => void;
  addProviderDocument: (providerId: string, doc: Omit<ProviderDocument, 'id' | 'uploadedAt'>) => void;

  // Actions — Intelligent Allocation & NGO
  runIntelligentAllocation: (donationId: string) => DonationAllocation[];
  manualAllocateDonation: (donationId: string, ngoId: string, quantity: number, reason: string) => void;
  acceptAllocation: (
    allocationId: string,
    acceptedQty: number,
    scheduledPickupTime: string,
    transportMode: string
  ) => void;
  declineAllocation: (allocationId: string, reason: string) => void;
  confirmPickupCollection: (pickupId: string, collectedQuantity: number, beneficiariesFed: number) => void;
  reportPickupIssue: (pickupId: string, status: 'DELAYED' | 'ISSUE_REPORTED', description: string) => void;
  submitPickupFeedback: (
    donationId: string,
    allocationId: string,
    rating: number,
    foodQualityNote: string,
    punctualityNote: string
  ) => void;
  updateNgoProfile: (ngoId: string, updates: Partial<NGO>) => void;
  addNgoDocument: (ngoId: string, documentType: 'NGO_REGISTRATION' | 'TRUST_DEED' | 'TAX_EXEMPTION_80G', fileName: string, fileSizeKb: number) => void;

  // Actions — Communication & Notifications
  sendChatMessage: (
    donationId: string,
    receiverId: string,
    receiverName: string,
    content: string,
    messageType: Message['messageType']
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Actions — Admin
  reviewVerification: (
    targetType: 'PROVIDER' | 'NGO',
    targetId: string,
    newStatus: VerificationStatus,
    remarks: string
  ) => void;
  updateUserAccountStatus: (userId: string, status: AccountStatus) => void;
  resolveComplaint: (complaintId: string, status: Complaint['status'], adminResponse: string) => void;
  createComplaint: (relatedDonationId: string, category: Complaint['category'], description: string) => void;
  resetDemoDataset: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [demoMode, setDemoMode] = useState<boolean>(checkDemoMode());
  const [demoPendingVerification, setDemoPendingVerification] =
    useState<DemoPendingVerification | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [providers, setProviders] = useState<FoodProvider[]>(DEMO_PROVIDERS);
  const [ngos, setNgos] = useState<NGO[]>(DEMO_NGOS);
  const [inventory, setInventory] = useState<InventoryRecord[]>(DEMO_INVENTORY);
  const [wasteHistory] = useState<WasteHistory[]>(DEMO_WASTE_HISTORY);
  const [predictions, setPredictions] = useState<SurplusPrediction[]>(DEMO_PREDICTIONS);
  const [donations, setDonations] = useState<Donation[]>(DEMO_DONATIONS);
  const [allocations, setAllocations] = useState<DonationAllocation[]>(DEMO_ALLOCATIONS);
  const [pickups, setPickups] = useState<PickupRecord[]>(DEMO_PICKUPS);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [verificationHistory, setVerificationHistory] = useState<VerificationRecord[]>(
    DEMO_VERIFICATION_HISTORY
  );
  const [feedback, setFeedback] = useState<FeedbackRecord[]>(DEMO_FEEDBACK);
  const [complaints, setComplaints] = useState<Complaint[]>(DEMO_COMPLAINTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const appendAudit = useCallback(
    (action: string, entityType: string, entityId: string, details: string, actor?: User | null) => {
      const actorObj = actor || currentUser;
      const log: AuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        actorId: actorObj?.id || 'system',
        actorName: actorObj?.name || 'System Engine',
        actorRole: actorObj?.role || 'ADMIN',
        action,
        entityType,
        entityId,
        details,
        createdAt: new Date().toISOString(),
      };
      setAuditLogs((prev) => [log, ...prev]);
    },
    [currentUser]
  );

  const toggleDemoMode = useCallback(
    (enabled: boolean) => {
      setRuntimeDemoMode(enabled);
      setDemoMode(enabled);
      if (!enabled) {
        setDemoPendingVerification(null);
      }
      pushToast({
        type: 'info',
        title: enabled ? 'Demo Mode Enabled' : 'Live Java API Mode Enabled',
        message: enabled
          ? 'Using local demonstration dataset. Nothing is persisted to MySQL.'
          : 'API requests will now target your Spring Boot backend.',
      });
    },
    [pushToast]
  );

  const setDemoPendingRegistration = useCallback(
    (info: Omit<DemoPendingVerification, 'generatedAt'> | null) => {
      if (!demoMode || !info) {
        setDemoPendingVerification(null);
        return;
      }
      setDemoPendingVerification({
        ...info,
        generatedAt: new Date().toISOString(),
      });
    },
    [demoMode]
  );

  const resendDemoRegistrationOtp = useCallback(
    (phoneOverride?: string): string | null => {
      if (!demoMode) return null;
      const targetPhone = (phoneOverride ?? demoPendingVerification?.phone ?? '').trim();
      if (!targetPhone) return null;
      const nextOtp = authService.resendDemoOtp(targetPhone);
      if (!nextOtp) return null;
      setDemoPendingVerification((prev) => ({
        organizationName: prev?.organizationName || 'Demo Registration',
        role: prev?.role || 'PROVIDER',
        email: prev?.email || '',
        phone: targetPhone,
        otp: nextOtp,
        generatedAt: new Date().toISOString(),
      }));
      pushToast({
        type: 'info',
        title: 'New Demo OTP Generated',
        message: `A fresh 6-digit Demo OTP was issued for ${targetPhone}.`,
      });
      return nextOtp;
    },
    [demoMode, demoPendingVerification, pushToast]
  );

  const loginWithCredentials = useCallback(
    async (email: string, password: string): Promise<User> => {
      if (!demoMode) {
        const session = await authService.login({ email, password });
        setCurrentUser(session.user);
        return session.user;
      }

      // Demo Mode email lookup (requires valid password length >= 6, no hardcoded passwords)
      if (password.trim().length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      const matched = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!matched) {
        throw new Error(
          'Email not found in demo directory. Use one of the quick Demo Portal sign-in options below.'
        );
      }
      if (matched.accountStatus === 'SUSPENDED') {
        throw new Error('This account has been suspended by an administrator.');
      }
      setAccessToken(`demo-memory-token-${matched.role.toLowerCase()}`);
      setCurrentUser(matched);
      return matched;
    },
    [demoMode, users]
  );

  const loginDemoRole = useCallback(
    (role: UserRole, userId?: string): User => {
      const target =
        (userId ? users.find((u) => u.id === userId) : undefined) ||
        users.find((u) => u.role === role && u.accountStatus === 'ACTIVE') ||
        users.find((u) => u.role === role)!;
      setAccessToken(`demo-memory-token-${target.role.toLowerCase()}`);
      setCurrentUser(target);
      pushToast({
        type: 'info',
        title: `Signed in (DEMO MODE): ${target.name}`,
        message: `Viewing ${target.role} portal as ${target.organizationName || target.role}.`,
      });
      return target;
    },
    [users, pushToast]
  );

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    pushToast({
      type: 'info',
      title: 'Signed out',
      message: 'Your in-memory session has been cleared.',
    });
  }, [pushToast]);

  const addInventoryRecord = useCallback(
    (record: Omit<InventoryRecord, 'id' | 'createdAt'>) => {
      const created: InventoryRecord = {
        ...record,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setInventory((prev) => [created, ...prev]);
      pushToast({
        type: 'success',
        title: 'Inventory Recorded',
        message: `${record.foodItemName} (${record.remainingQuantity} meals remaining) saved in demo state.`,
      });
    },
    [pushToast]
  );

  const updateInventoryRecord = useCallback(
    (id: string, updates: Partial<InventoryRecord>) => {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextPrepared = updates.quantityPrepared ?? item.quantityPrepared;
          const nextSold = updates.quantitySold ?? item.quantitySold;
          return {
            ...item,
            ...updates,
            remainingQuantity: Math.max(0, nextPrepared - nextSold),
          };
        })
      );
      pushToast({ type: 'success', title: 'Inventory Updated' });
    },
    [pushToast]
  );

  const deleteInventoryRecord = useCallback(
    (id: string) => {
      setInventory((prev) => prev.filter((i) => i.id !== id));
      pushToast({ type: 'info', title: 'Inventory Record Removed' });
    },
    [pushToast]
  );

  const recalculatePrediction = useCallback(
    (providerId: string): SurplusPrediction => {
      const next = calculateStatisticalPrediction(
        providerId,
        wasteHistory,
        inventory,
        new Date().toISOString()
      );
      setPredictions((prev) => {
        const exists = prev.some((p) => p.id === next.id);
        return exists ? prev.map((p) => (p.id === next.id ? next : p)) : [next, ...prev];
      });
      pushToast({
        type: 'success',
        title: 'Surplus Prediction Recalculated',
        message: `Estimated ${next.predictedSurplusMeals} meals (${next.confidenceScore}% confidence). Confirmation required before NGO allocation.`,
      });
      return next;
    },
    [wasteHistory, inventory, pushToast]
  );

  const runIntelligentAllocation = useCallback(
    (donationId: string): DonationAllocation[] => {
      const targetDonation = donations.find((d) => d.id === donationId);
      if (!targetDonation) return [];

      const plan = computeIntelligentAllocationPlan(targetDonation, ngos, allocations);
      if (!plan.eligible || plan.recommendations.length === 0) {
        pushToast({
          type: 'error',
          title: 'Allocation Blocked',
          message: plan.blockReason || 'No eligible NGOs found.',
        });
        return [];
      }

      const nowIso = new Date().toISOString();
      const createdAllocations: DonationAllocation[] = plan.recommendations.map((rec, idx) => ({
        id: `ALC-${Date.now().toString().slice(-4)}${idx}`,
        donationId: targetDonation.id,
        providerId: targetDonation.providerId,
        providerName: targetDonation.providerName,
        ngoId: rec.ngoId,
        ngoName: rec.ngoName,
        foodName: targetDonation.foodName,
        category: targetDonation.category,
        allocatedQuantity: rec.recommendedMeals,
        status: 'PENDING',
        selectionReasons: rec.reasons,
        matchScore: rec.score,
        distanceKm: rec.distanceKm,
        safeUseDeadline: targetDonation.safeUseDeadline,
        pickupAddress: targetDonation.pickupAddress,
        assignedBy: 'INTELLIGENT_ENGINE',
        createdAt: nowIso,
        updatedAt: nowIso,
      }));

      const totalAllocatedNow = createdAllocations.reduce((s, a) => s + a.allocatedQuantity, 0);
      const nextAllocatedTotal = targetDonation.allocatedQuantity + totalAllocatedNow;
      const nextRemaining = Math.max(0, targetDonation.confirmedQuantity - nextAllocatedTotal);

      setAllocations((prev) => [...createdAllocations, ...prev]);
      setDonations((prev) =>
        prev.map((d) =>
          d.id === donationId
            ? {
                ...d,
                allocatedQuantity: nextAllocatedTotal,
                remainingQuantity: nextRemaining,
                status: nextRemaining === 0 ? 'FULLY_ALLOCATED' : 'PARTIALLY_ALLOCATED',
              }
            : d
        )
      );

      // Notify assigned NGOs and provider
      const newNotifs: Notification[] = createdAllocations.map((alc) => {
        const ngoUser = users.find((u) => u.organizationId === alc.ngoId);
        return {
          id: `not-${Date.now()}-${alc.ngoId}`,
          userId: ngoUser?.id || 'usr-ngo-1',
          targetRole: 'NGO',
          title: `New Allocation: ${alc.allocatedQuantity} Meals`,
          message: `${targetDonation.providerName} confirmed ${alc.foodName}. Review and accept pickup.`,
          type: 'ALLOCATION',
          relatedDonationId: targetDonation.id,
          isRead: false,
          createdAt: nowIso,
        };
      });

      setNotifications((prev) => [...newNotifs, ...prev]);
      appendAudit(
        'INTELLIGENT_ALLOCATION',
        'Donation',
        donationId,
        `Allocated ${totalAllocatedNow} meals across ${createdAllocations.length} verified NGOs.`
      );
      pushToast({
        type: 'success',
        title: 'Intelligent Multi-NGO Allocation Complete',
        message: `${totalAllocatedNow} meals distributed across ${createdAllocations.length} NGOs.`,
      });
      return createdAllocations;
    },
    [donations, ngos, allocations, users, appendAudit, pushToast]
  );

  const confirmPredictionSurplus = useCallback(
    (
      predictionId: string,
      status: PredictionConfirmationStatus,
      confirmedMeals?: number,
      notes?: string
    ): Donation | null => {
      const pred = predictions.find((p) => p.id === predictionId);
      if (!pred) return null;

      if (status === 'DECLINED' || status === 'REMIND_LATER') {
        setPredictions((prev) =>
          prev.map((p) =>
            p.id === predictionId ? { ...p, confirmationStatus: status, providerNotes: notes } : p
          )
        );
        pushToast({
          type: 'info',
          title: status === 'DECLINED' ? 'Prediction Declined' : 'Reminder Snoozed',
          message:
            status === 'DECLINED'
              ? 'No donation was created. Predicted surplus is never shared automatically.'
              : 'You will be reminded again before kitchen close.',
        });
        return null;
      }

      const provider = providers.find((pr) => pr.id === pred.providerId);
      const finalMeals = Math.max(1, confirmedMeals ?? pred.predictedSurplusMeals);
      const donationId = `DON-${new Date().getFullYear()}-${Math.floor(200 + Math.random() * 799)}`;
      const nowIso = new Date().toISOString();

      const newDonation: Donation = {
        id: donationId,
        providerId: pred.providerId,
        providerName: provider?.organizationName || 'Verified Provider',
        providerType: provider?.organizationType || 'HOTEL',
        foodName: `Confirmed Daily Surplus (${pred.predictedCategories
          .map((c) => c.replace(/_/g, ' '))
          .join(', ')})`,
        category: pred.predictedCategories[0] || 'COOKED_MEALS',
        sourceType: 'PREDICTION_CONFIRMED',
        predictionId: pred.id,
        confirmedQuantity: finalMeals,
        allocatedQuantity: 0,
        remainingQuantity: finalMeals,
        estimatedMeals: finalMeals,
        preparationTime: new Date(Date.now() - 2 * 3600000).toISOString(),
        readyForPickupTime: new Date(Date.now() + 0.5 * 3600000).toISOString(),
        safeUseDeadline: new Date(Date.now() + 5 * 3600000).toISOString(),
        storageDetails: 'Insulated stainless steel food-grade containers',
        pickupAddress: provider
          ? `${provider.address}, ${provider.city} ${provider.postalCode}`
          : 'Registered Provider Kitchen',
        city: provider?.city || 'Chennai',
        latitude: provider?.latitude,
        longitude: provider?.longitude,
        handlingInstructions: notes || 'Confirmed from 7–8 PM surplus prompt.',
        safetyDeclaredByProvider: true,
        status: 'PENDING_ALLOCATION',
        createdAt: nowIso,
      };

      setDonations((prev) => [newDonation, ...prev]);
      setPredictions((prev) =>
        prev.map((p) =>
          p.id === predictionId
            ? {
                ...p,
                confirmationStatus: status,
                confirmedMeals: finalMeals,
                confirmedDonationId: donationId,
                providerNotes: notes,
              }
            : p
        )
      );

      appendAudit(
        'CONFIRM_SURPLUS_DONATION',
        'Donation',
        donationId,
        `Provider confirmed ${finalMeals} meals from surplus prediction ${predictionId}.`
      );
      pushToast({
        type: 'success',
        title: `Donation ${donationId} Confirmed`,
        message: `${finalMeals} meals are now eligible for Intelligent NGO Allocation.`,
      });
      return newDonation;
    },
    [predictions, providers, appendAudit, pushToast]
  );

  const createVoluntaryDonation = useCallback(
    (payload: {
      providerId: string;
      foodName: string;
      category: FoodCategory;
      estimatedMeals: number;
      preparationTime: string;
      readyForPickupTime: string;
      safeUseDeadline: string;
      storageDetails: string;
      allergenInfo?: string;
      pickupAddress: string;
      handlingInstructions?: string;
    }): Donation => {
      const provider = providers.find((pr) => pr.id === payload.providerId);
      const donationId = `DON-${new Date().getFullYear()}-${Math.floor(200 + Math.random() * 799)}`;
      const newDonation: Donation = {
        id: donationId,
        providerId: payload.providerId,
        providerName: provider?.organizationName || 'Food Provider',
        providerType: provider?.organizationType || 'HOTEL',
        foodName: payload.foodName,
        category: payload.category,
        sourceType: 'VOLUNTARY',
        confirmedQuantity: payload.estimatedMeals,
        allocatedQuantity: 0,
        remainingQuantity: payload.estimatedMeals,
        estimatedMeals: payload.estimatedMeals,
        preparationTime: payload.preparationTime,
        readyForPickupTime: payload.readyForPickupTime,
        safeUseDeadline: payload.safeUseDeadline,
        storageDetails: payload.storageDetails,
        allergenInfo: payload.allergenInfo,
        pickupAddress: payload.pickupAddress,
        city: provider?.city || 'Chennai',
        latitude: provider?.latitude,
        longitude: provider?.longitude,
        handlingInstructions: payload.handlingInstructions,
        safetyDeclaredByProvider: true,
        status: 'PENDING_ALLOCATION',
        createdAt: new Date().toISOString(),
      };

      setDonations((prev) => [newDonation, ...prev]);
      appendAudit(
        'CREATE_VOLUNTARY_DONATION',
        'Donation',
        donationId,
        `Voluntary donation of ${payload.estimatedMeals} meals created.`
      );
      pushToast({
        type: 'success',
        title: `Voluntary Donation ${donationId} Created`,
        message: 'Ready for Intelligent NGO Allocation.',
      });
      return newDonation;
    },
    [providers, appendAudit, pushToast]
  );

  const manualAllocateDonation = useCallback(
    (donationId: string, ngoId: string, quantity: number, reason: string) => {
      const donation = donations.find((d) => d.id === donationId);
      const ngo = ngos.find((n) => n.id === ngoId);
      if (!donation || !ngo) return;

      if (new Date(donation.safeUseDeadline).getTime() <= Date.now()) {
        pushToast({ type: 'error', title: 'Cannot allocate expired food.' });
        return;
      }
      if (quantity <= 0 || quantity > donation.remainingQuantity) {
        pushToast({
          type: 'error',
          title: 'Invalid Quantity',
          message: `Maximum allocatable remaining quantity is ${donation.remainingQuantity} meals.`,
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const newAlloc: DonationAllocation = {
        id: `ALC-${Date.now().toString().slice(-4)}`,
        donationId: donation.id,
        providerId: donation.providerId,
        providerName: donation.providerName,
        ngoId: ngo.id,
        ngoName: ngo.ngoName,
        foodName: donation.foodName,
        category: donation.category,
        allocatedQuantity: quantity,
        status: 'PENDING',
        selectionReasons: [reason || 'Manual administrator assignment'],
        matchScore: 88,
        distanceKm: 3.5,
        safeUseDeadline: donation.safeUseDeadline,
        pickupAddress: donation.pickupAddress,
        assignedBy: 'ADMIN_MANUAL',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const nextAllocTotal = donation.allocatedQuantity + quantity;
      const nextRem = Math.max(0, donation.confirmedQuantity - nextAllocTotal);

      setAllocations((prev) => [newAlloc, ...prev]);
      setDonations((prev) =>
        prev.map((d) =>
          d.id === donationId
            ? {
                ...d,
                allocatedQuantity: nextAllocTotal,
                remainingQuantity: nextRem,
                status: nextRem === 0 ? 'FULLY_ALLOCATED' : 'PARTIALLY_ALLOCATED',
              }
            : d
        )
      );
      appendAudit(
        'ADMIN_MANUAL_ALLOCATION',
        'DonationAllocation',
        newAlloc.id,
        `Manually allocated ${quantity} meals of ${donationId} to ${ngo.ngoName}. Reason: ${reason}`
      );
      pushToast({
        type: 'success',
        title: 'Manual Allocation Assigned',
        message: `${quantity} meals assigned to ${ngo.ngoName}.`,
      });
    },
    [donations, ngos, appendAudit, pushToast]
  );

  const acceptAllocation = useCallback(
    (
      allocationId: string,
      acceptedQty: number,
      scheduledPickupTime: string,
      transportMode: string
    ) => {
      const target = allocations.find((a) => a.id === allocationId);
      if (!target) return;

      const qtyDiff = target.allocatedQuantity - acceptedQty;
      const finalQty = Math.min(target.allocatedQuantity, Math.max(1, acceptedQty));
      const nowIso = new Date().toISOString();

      setAllocations((prev) =>
        prev.map((a) =>
          a.id === allocationId
            ? {
                ...a,
                allocatedQuantity: finalQty,
                status: 'PICKUP_SCHEDULED',
                scheduledPickupTime,
                transportMode,
                updatedAt: nowIso,
              }
            : a
        )
      );

      // If NGO accepted partial quantity, return unaccepted delta to donation remainingQuantity
      if (qtyDiff > 0) {
        setDonations((prev) =>
          prev.map((d) => {
            if (d.id !== target.donationId) return d;
            const nextAllocated = Math.max(0, d.allocatedQuantity - qtyDiff);
            const nextRemaining = d.confirmedQuantity - nextAllocated;
            return {
              ...d,
              allocatedQuantity: nextAllocated,
              remainingQuantity: nextRemaining,
              status: nextRemaining > 0 ? 'PARTIALLY_ALLOCATED' : 'PICKUP_SCHEDULED',
            };
          })
        );
      } else {
        setDonations((prev) =>
          prev.map((d) =>
            d.id === target.donationId && d.remainingQuantity === 0
              ? { ...d, status: 'PICKUP_SCHEDULED' }
              : d
          )
        );
      }

      const newPickup: PickupRecord = {
        id: `PKP-${Date.now().toString().slice(-4)}`,
        allocationId: target.id,
        donationId: target.donationId,
        ngoId: target.ngoId,
        ngoName: target.ngoName,
        providerName: target.providerName,
        foodName: target.foodName,
        assignedQuantity: finalQty,
        pickupAddress: target.pickupAddress,
        scheduledTime: scheduledPickupTime,
        status: 'SCHEDULED',
        deadline: target.safeUseDeadline,
      };
      setPickups((prev) => [newPickup, ...prev]);

      // Notify provider
      const provUser = users.find((u) => u.organizationId === target.providerId);
      setNotifications((prev) => [
        {
          id: `not-${Date.now()}`,
          userId: provUser?.id || 'usr-prov-1',
          targetRole: 'PROVIDER',
          title: `Pickup Scheduled by ${target.ngoName}`,
          message: `${target.ngoName} accepted ${finalQty} meals (${target.donationId}) via ${transportMode}.`,
          type: 'PICKUP',
          relatedDonationId: target.donationId,
          isRead: false,
          createdAt: nowIso,
        },
        ...prev,
      ]);

      appendAudit(
        'NGO_ACCEPT_ALLOCATION',
        'DonationAllocation',
        allocationId,
        `${target.ngoName} accepted ${finalQty} meals and scheduled pickup.`
      );
      pushToast({
        type: 'success',
        title: 'Allocation Accepted & Pickup Scheduled',
        message: `Scheduled collection for ${finalQty} meals.`,
      });
    },
    [allocations, users, appendAudit, pushToast]
  );

  const declineAllocation = useCallback(
    (allocationId: string, reason: string) => {
      const target = allocations.find((a) => a.id === allocationId);
      if (!target) return;
      const nowIso = new Date().toISOString();

      setAllocations((prev) =>
        prev.map((a) =>
          a.id === allocationId
            ? { ...a, status: 'REJECTED', declineReason: reason, updatedAt: nowIso }
            : a
        )
      );

      setDonations((prev) =>
        prev.map((d) => {
          if (d.id !== target.donationId) return d;
          const nextAllocated = Math.max(0, d.allocatedQuantity - target.allocatedQuantity);
          const nextRemaining = d.confirmedQuantity - nextAllocated;
          return {
            ...d,
            allocatedQuantity: nextAllocated,
            remainingQuantity: nextRemaining,
            status: nextAllocated === 0 ? 'PENDING_ALLOCATION' : 'PARTIALLY_ALLOCATED',
          };
        })
      );

      appendAudit(
        'NGO_DECLINE_ALLOCATION',
        'DonationAllocation',
        allocationId,
        `${target.ngoName} declined ${target.allocatedQuantity} meals. Reason: ${reason}`
      );
      pushToast({
        type: 'info',
        title: 'Allocation Declined',
        message: `${target.allocatedQuantity} meals returned to available pool for reallocation.`,
      });
    },
    [allocations, appendAudit, pushToast]
  );

  const confirmPickupCollection = useCallback(
    (pickupId: string, collectedQuantity: number, beneficiariesFed: number) => {
      const targetPickup = pickups.find((p) => p.id === pickupId);
      if (!targetPickup) return;
      const nowIso = new Date().toISOString();

      setPickups((prev) =>
        prev.map((p) =>
          p.id === pickupId
            ? {
                ...p,
                collectedQuantity,
                beneficiariesFed,
                actualCollectionTime: p.actualCollectionTime || nowIso,
                distributionConfirmedAt: nowIso,
                status: 'DISTRIBUTED',
              }
            : p
        )
      );

      const nextAllocations = allocations.map((a) =>
        a.id === targetPickup.allocationId
          ? {
              ...a,
              collectedQuantity,
              status: 'COMPLETED' as const,
              updatedAt: nowIso,
            }
          : a
      );
      setAllocations(nextAllocations);

      // Update donation status if all non-rejected allocations for this donation are completed
      const siblingAllocs = nextAllocations.filter(
        (a) => a.donationId === targetPickup.donationId && a.status !== 'REJECTED' && a.status !== 'CANCELLED'
      );
      const allCompleted =
        siblingAllocs.length > 0 && siblingAllocs.every((a) => a.status === 'COMPLETED');

      setDonations((prev) =>
        prev.map((d) => {
          if (d.id !== targetPickup.donationId) return d;
          return {
            ...d,
            status: allCompleted && d.remainingQuantity === 0 ? 'COMPLETED' : 'COLLECTED',
          };
        })
      );

      appendAudit(
        'COLLECTION_AND_DISTRIBUTION_CONFIRMED',
        'PickupRecord',
        pickupId,
        `${targetPickup.ngoName} collected ${collectedQuantity} meals and confirmed distribution to ${beneficiariesFed} beneficiaries.`
      );
      pushToast({
        type: 'success',
        title: 'Collection & Distribution Confirmed',
        message: `${collectedQuantity} meals recorded as delivered to ${beneficiariesFed} beneficiaries.`,
      });
    },
    [pickups, allocations, appendAudit, pushToast]
  );

  const reportPickupIssue = useCallback(
    (pickupId: string, status: 'DELAYED' | 'ISSUE_REPORTED', description: string) => {
      setPickups((prev) =>
        prev.map((p) =>
          p.id === pickupId
            ? {
                ...p,
                status,
                delayReason: status === 'DELAYED' ? description : p.delayReason,
                issueDescription: status === 'ISSUE_REPORTED' ? description : p.issueDescription,
              }
            : p
        )
      );
      pushToast({
        type: 'info',
        title: status === 'DELAYED' ? 'Delay Logged' : 'Pickup Issue Reported',
        message: 'Provider and administrators have been notified.',
      });
    },
    [pushToast]
  );

  const submitPickupFeedback = useCallback(
    (
      donationId: string,
      allocationId: string,
      rating: number,
      foodQualityNote: string,
      punctualityNote: string
    ) => {
      const fb: FeedbackRecord = {
        id: `fb-${Date.now()}`,
        donationId,
        allocationId,
        fromRole: currentUser?.role === 'PROVIDER' ? 'PROVIDER' : 'NGO',
        authorName: currentUser?.organizationName || currentUser?.name || 'NGO Partner',
        rating,
        foodQualityNote,
        punctualityNote,
        createdAt: new Date().toISOString(),
      };
      setFeedback((prev) => [fb, ...prev]);
      pushToast({ type: 'success', title: 'Feedback Submitted' });
    },
    [currentUser, pushToast]
  );

  const updateProviderProfile = useCallback(
    (providerId: string, updates: Partial<FoodProvider>) => {
      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, ...updates } : p)));
      pushToast({ type: 'success', title: 'Provider Profile Updated' });
    },
    [pushToast]
  );

  const addProviderDocument = useCallback(
    (providerId: string, doc: Omit<ProviderDocument, 'id' | 'uploadedAt'>) => {
      const newDoc: ProviderDocument = {
        ...doc,
        id: `pdoc-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? {
                ...p,
                verificationStatus:
                  p.verificationStatus === 'NOT_SUBMITTED' || p.verificationStatus === 'CORRECTION_REQUIRED'
                    ? 'PENDING_REVIEW'
                    : p.verificationStatus,
                documents: [newDoc, ...p.documents],
              }
            : p
        )
      );
      pushToast({
        type: 'success',
        title: 'Document Uploaded',
        message: 'Queued for administrator verification review.',
      });
    },
    [pushToast]
  );

  const updateNgoProfile = useCallback(
    (ngoId: string, updates: Partial<NGO>) => {
      setNgos((prev) => prev.map((n) => (n.id === ngoId ? { ...n, ...updates } : n)));
      pushToast({ type: 'success', title: 'NGO Profile Updated' });
    },
    [pushToast]
  );

  const addNgoDocument = useCallback(
    (
      ngoId: string,
      documentType: 'NGO_REGISTRATION' | 'TRUST_DEED' | 'TAX_EXEMPTION_80G',
      fileName: string,
      fileSizeKb: number
    ) => {
      setNgos((prev) =>
        prev.map((n) =>
          n.id === ngoId
            ? {
                ...n,
                verificationStatus:
                  n.verificationStatus === 'NOT_SUBMITTED' || n.verificationStatus === 'CORRECTION_REQUIRED'
                    ? 'PENDING_REVIEW'
                    : n.verificationStatus,
                documents: [
                  {
                    id: `ndoc-${Date.now()}`,
                    ngoId,
                    documentType,
                    fileName,
                    fileSizeKb,
                    uploadedAt: new Date().toISOString(),
                  },
                  ...n.documents,
                ],
              }
            : n
        )
      );
      pushToast({ type: 'success', title: 'NGO Document Uploaded' });
    },
    [pushToast]
  );

  const sendChatMessage = useCallback(
    (
      donationId: string,
      receiverId: string,
      receiverName: string,
      content: string,
      messageType: Message['messageType']
    ) => {
      if (!currentUser || !content.trim()) return;
      const msg: Message = {
        id: `msg-${Date.now()}`,
        donationId,
        senderId: currentUser.id,
        senderName: `${currentUser.name} (${currentUser.organizationName || currentUser.role})`,
        senderRole: currentUser.role,
        receiverId,
        receiverName,
        content: content.trim(),
        messageType,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
    },
    [currentUser]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.targetRole === currentUser.role ? { ...n, isRead: true } : n))
    );
  }, [currentUser]);

  const reviewVerification = useCallback(
    (
      targetType: 'PROVIDER' | 'NGO',
      targetId: string,
      newStatus: VerificationStatus,
      remarks: string
    ) => {
      const nowIso = new Date().toISOString();
      let targetName = targetId;
      let prevStatus: VerificationStatus = 'PENDING_REVIEW';

      if (targetType === 'PROVIDER') {
        const found = providers.find((p) => p.id === targetId);
        if (found) {
          targetName = found.organizationName;
          prevStatus = found.verificationStatus;
        }
        setProviders((prev) =>
          prev.map((p) =>
            p.id === targetId
              ? { ...p, verificationStatus: newStatus, verificationNote: remarks }
              : p
          )
        );
      } else {
        const found = ngos.find((n) => n.id === targetId);
        if (found) {
          targetName = found.ngoName;
          prevStatus = found.verificationStatus;
        }
        setNgos((prev) =>
          prev.map((n) =>
            n.id === targetId
              ? { ...n, verificationStatus: newStatus, verificationNote: remarks }
              : n
          )
        );
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.organizationId === targetId
            ? {
                ...u,
                verificationStatus: newStatus,
                accountStatus: newStatus === 'APPROVED' ? 'ACTIVE' : u.accountStatus,
              }
            : u
        )
      );

      setVerificationHistory((prev) => [
        {
          id: `ver-${Date.now()}`,
          targetType,
          targetId,
          targetName,
          previousStatus: prevStatus,
          newStatus,
          reviewedByAdminId: currentUser?.id || 'usr-admin-1',
          reviewedByAdminName: currentUser?.name || 'Administrator',
          remarks,
          createdAt: nowIso,
        },
        ...prev,
      ]);

      appendAudit(
        `VERIFY_${targetType}_${newStatus}`,
        targetType,
        targetId,
        `${targetName} updated from ${prevStatus} to ${newStatus}. Remarks: ${remarks}`
      );
      pushToast({
        type: 'success',
        title: `${targetName} — ${newStatus.replace(/_/g, ' ')}`,
      });
    },
    [providers, ngos, currentUser, appendAudit, pushToast]
  );

  const updateUserAccountStatus = useCallback(
    (userId: string, status: AccountStatus) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u)));
      appendAudit('UPDATE_ACCOUNT_STATUS', 'User', userId, `Account status set to ${status}.`);
      pushToast({ type: 'info', title: `Account marked ${status}` });
    },
    [appendAudit, pushToast]
  );

  const resolveComplaint = useCallback(
    (complaintId: string, status: Complaint['status'], adminResponse: string) => {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                status,
                adminResponse,
                resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : undefined,
              }
            : c
        )
      );
      appendAudit('UPDATE_COMPLAINT', 'Complaint', complaintId, `Complaint marked ${status}.`);
      pushToast({ type: 'success', title: `Complaint ${complaintId} Updated` });
    },
    [appendAudit, pushToast]
  );

  const createComplaint = useCallback(
    (relatedDonationId: string, category: Complaint['category'], description: string) => {
      if (!currentUser) return;
      const newComp: Complaint = {
        id: `CMP-${Math.floor(105 + Math.random() * 890)}`,
        reportedByUserId: currentUser.id,
        reportedByName: currentUser.organizationName || currentUser.name,
        reportedByRole: currentUser.role === 'NGO' ? 'NGO' : 'PROVIDER',
        relatedDonationId,
        category,
        description,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };
      setComplaints((prev) => [newComp, ...prev]);
      pushToast({ type: 'success', title: `Support Ticket ${newComp.id} Filed` });
    },
    [currentUser, pushToast]
  );

  const resetDemoDataset = useCallback(() => {
    setUsers(DEMO_USERS);
    setProviders(DEMO_PROVIDERS);
    setNgos(DEMO_NGOS);
    setInventory(DEMO_INVENTORY);
    setPredictions(DEMO_PREDICTIONS);
    setDonations(DEMO_DONATIONS);
    setAllocations(DEMO_ALLOCATIONS);
    setPickups(DEMO_PICKUPS);
    setMessages(DEMO_MESSAGES);
    setNotifications(DEMO_NOTIFICATIONS);
    setVerificationHistory(DEMO_VERIFICATION_HISTORY);
    setFeedback(DEMO_FEEDBACK);
    setComplaints(DEMO_COMPLAINTS);
    setAuditLogs(DEMO_AUDIT_LOGS);
    pushToast({ type: 'info', title: 'Demo Dataset Reset to Initial State' });
  }, [pushToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      demoMode,
      toggleDemoMode,
      demoPendingVerification,
      setDemoPendingRegistration,
      resendDemoRegistrationOtp,
      currentUser,
      loginWithCredentials,
      loginDemoRole,
      logout,
      toasts,
      pushToast,
      dismissToast,
      users,
      providers,
      ngos,
      inventory,
      wasteHistory,
      predictions,
      donations,
      allocations,
      pickups,
      messages,
      notifications,
      verificationHistory,
      feedback,
      complaints,
      auditLogs,
      addInventoryRecord,
      updateInventoryRecord,
      deleteInventoryRecord,
      recalculatePrediction,
      confirmPredictionSurplus,
      createVoluntaryDonation,
      updateProviderProfile,
      addProviderDocument,
      runIntelligentAllocation,
      manualAllocateDonation,
      acceptAllocation,
      declineAllocation,
      confirmPickupCollection,
      reportPickupIssue,
      submitPickupFeedback,
      updateNgoProfile,
      addNgoDocument,
      sendChatMessage,
      markNotificationRead,
      markAllNotificationsRead,
      reviewVerification,
      updateUserAccountStatus,
      resolveComplaint,
      createComplaint,
      resetDemoDataset,
    }),
    [
      demoMode,
      toggleDemoMode,
      demoPendingVerification,
      setDemoPendingRegistration,
      resendDemoRegistrationOtp,
      currentUser,
      loginWithCredentials,
      loginDemoRole,
      logout,
      toasts,
      pushToast,
      dismissToast,
      users,
      providers,
      ngos,
      inventory,
      wasteHistory,
      predictions,
      donations,
      allocations,
      pickups,
      messages,
      notifications,
      verificationHistory,
      feedback,
      complaints,
      auditLogs,
      addInventoryRecord,
      updateInventoryRecord,
      deleteInventoryRecord,
      recalculatePrediction,
      confirmPredictionSurplus,
      createVoluntaryDonation,
      updateProviderProfile,
      addProviderDocument,
      runIntelligentAllocation,
      manualAllocateDonation,
      acceptAllocation,
      declineAllocation,
      confirmPickupCollection,
      reportPickupIssue,
      submitPickupFeedback,
      updateNgoProfile,
      addNgoDocument,
      sendChatMessage,
      markNotificationRead,
      markAllNotificationsRead,
      reviewVerification,
      updateUserAccountStatus,
      resolveComplaint,
      createComplaint,
      resetDemoDataset,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
