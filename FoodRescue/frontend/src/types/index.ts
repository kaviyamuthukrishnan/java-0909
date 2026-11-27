export type UserRole = 'PROVIDER' | 'NGO' | 'ADMIN';

export type VerificationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CORRECTION_REQUIRED';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'REJECTED';

export type FoodCategory =
  | 'COOKED_MEALS'
  | 'RICE_AND_CURRIES'
  | 'BAKERY_AND_BREAD'
  | 'FRESH_PRODUCE'
  | 'DAIRY_AND_DESSERTS'
  | 'PACKAGED_STAPLES';

export type DonationStatus =
  | 'PENDING_ALLOCATION'
  | 'PARTIALLY_ALLOCATED'
  | 'FULLY_ALLOCATED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'UNCLAIMED';

export type AllocationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PredictionConfirmationStatus =
  | 'PENDING'
  | 'CONFIRMED_FULL'
  | 'CONFIRMED_PARTIAL'
  | 'CONFIRMED_CUSTOM'
  | 'DECLINED'
  | 'REMIND_LATER';

export type ProviderOrgType =
  | 'HOTEL'
  | 'RESTAURANT'
  | 'HOSTEL'
  | 'MESS'
  | 'COLLEGE_CANTEEN'
  | 'BAKERY'
  | 'CATERING';

export type NgoOrgType =
  | 'COMMUNITY_KITCHEN'
  | 'SHELTER_HOME'
  | 'CHILD_WELFARE'
  | 'ELDER_CARE'
  | 'FOOD_BANK';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface ProviderDocument {
  id: string;
  providerId: string;
  documentType: 'FSSAI_LICENSE' | 'BUSINESS_REGISTRATION' | 'HYGIENE_CERTIFICATE';
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  extractedFields?: {
    licenseNumber?: string;
    organizationName?: string;
    validUntil?: string;
    inconsistencies: string[];
    disclaimer: string;
  };
}

export interface FoodProvider {
  id: string;
  userId: string;
  organizationName: string;
  organizationType: ProviderOrgType;
  managerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  operatingHours: string;
  foodCategories: FoodCategory[];
  dailyMealCapacity: number;
  fssaiNumber: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  documents: ProviderDocument[];
  createdAt: string;
}

export interface NgoDocument {
  id: string;
  ngoId: string;
  documentType: 'NGO_REGISTRATION' | 'TRUST_DEED' | 'TAX_EXEMPTION_80G';
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
}

export interface NGO {
  id: string;
  userId: string;
  ngoName: string;
  registrationNumber: string;
  organizationType: NgoOrgType;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  serviceLocations: string[];
  latitude?: number;
  longitude?: number;
  beneficiaryCount: number;
  dailyMealRequirement: number;
  acceptedCategories: FoodCategory[];
  maxCollectionCapacity: number;
  transportAvailable: boolean;
  transportType: string;
  volunteerCount: number;
  operatingHours: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  documents: NgoDocument[];
  createdAt: string;
}

export interface FoodItem {
  id: string;
  providerId: string;
  name: string;
  category: FoodCategory;
  defaultStorage: string;
  unit: 'meals' | 'kg' | 'packs';
}

export interface InventoryRecord {
  id: string;
  providerId: string;
  foodItemName: string;
  category: FoodCategory;
  quantityPrepared: number;
  quantitySold: number;
  remainingQuantity: number;
  date: string;
  preparationTime: string;
  storageInfo: string;
  safeUseDeadline: string;
  notes?: string;
  createdAt: string;
}

export interface WasteHistory {
  id: string;
  providerId: string;
  date: string;
  dayOfWeek: number; // 0-6
  category: FoodCategory;
  preparedMeals: number;
  soldMeals: number;
  surplusMeals: number;
  donatedMeals: number;
  wastedMeals: number;
}

export interface PredictionFactor {
  label: string;
  impact: string;
  weight: string;
}

export interface SurplusPrediction {
  id: string;
  providerId: string;
  predictionDate: string;
  scheduledPromptWindow: string; // e.g. "19:00 - 20:00"
  predictedSurplusMeals: number;
  predictedCategories: FoodCategory[];
  confidenceScore: number; // 0-100
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW_INSUFFICIENT_DATA';
  historicalDaysUsed: number;
  modelType: 'WEIGHTED_HISTORICAL_REGRESSION' | 'SIMPLE_STATISTICAL_BASELINE';
  factors: PredictionFactor[];
  confirmationStatus: PredictionConfirmationStatus;
  confirmedMeals?: number;
  confirmedDonationId?: string;
  providerNotes?: string;
}

export interface Donation {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ProviderOrgType;
  foodName: string;
  category: FoodCategory;
  sourceType: 'PREDICTION_CONFIRMED' | 'VOLUNTARY';
  predictionId?: string;
  confirmedQuantity: number;
  allocatedQuantity: number;
  remainingQuantity: number;
  estimatedMeals: number;
  preparationTime: string;
  readyForPickupTime: string;
  safeUseDeadline: string;
  storageDetails: string;
  allergenInfo?: string;
  pickupAddress: string;
  city: string;
  latitude?: number;
  longitude?: number;
  handlingInstructions?: string;
  safetyDeclaredByProvider: boolean;
  status: DonationStatus;
  createdAt: string;
}

export interface AllocationCriteriaScore {
  ngoId: string;
  ngoName: string;
  score: number;
  distanceKm: number;
  requestedMeals: number;
  recommendedMeals: number;
  reasons: string[];
}

export interface DonationAllocation {
  id: string;
  donationId: string;
  providerId: string;
  providerName: string;
  ngoId: string;
  ngoName: string;
  foodName: string;
  category: FoodCategory;
  allocatedQuantity: number;
  collectedQuantity?: number;
  status: AllocationStatus;
  selectionReasons: string[];
  matchScore: number;
  distanceKm: number;
  scheduledPickupTime?: string;
  safeUseDeadline: string;
  pickupAddress: string;
  transportMode?: string;
  declineReason?: string;
  assignedBy: 'INTELLIGENT_ENGINE' | 'ADMIN_MANUAL';
  createdAt: string;
  updatedAt: string;
}

export interface PickupRecord {
  id: string;
  allocationId: string;
  donationId: string;
  ngoId: string;
  ngoName: string;
  providerName: string;
  foodName: string;
  assignedQuantity: number;
  collectedQuantity?: number;
  pickupAddress: string;
  scheduledTime: string;
  actualCollectionTime?: string;
  distributionConfirmedAt?: string;
  beneficiariesFed?: number;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELAYED' | 'COLLECTED' | 'DISTRIBUTED' | 'ISSUE_REPORTED';
  delayReason?: string;
  issueDescription?: string;
  deadline: string;
}

export interface Message {
  id: string;
  donationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string;
  messageType: 'CHAT' | 'TIME_NEGOTIATION' | 'PICKUP_INSTRUCTIONS' | 'QUANTITY_UPDATE' | 'DELAY_ALERT';
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  targetRole: UserRole;
  title: string;
  message: string;
  type: 'SURPLUS_CONFIRMATION' | 'ALLOCATION' | 'PICKUP' | 'VERIFICATION' | 'DEADLINE_ALERT' | 'COMPLAINT';
  relatedDonationId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  targetType: 'PROVIDER' | 'NGO';
  targetId: string;
  targetName: string;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  reviewedByAdminId: string;
  reviewedByAdminName: string;
  remarks: string;
  createdAt: string;
}

export interface FeedbackRecord {
  id: string;
  donationId: string;
  allocationId: string;
  fromRole: 'PROVIDER' | 'NGO';
  authorName: string;
  rating: number; // 1-5
  foodQualityNote: string;
  punctualityNote: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  reportedByUserId: string;
  reportedByName: string;
  reportedByRole: 'PROVIDER' | 'NGO';
  relatedDonationId: string;
  category: 'COLLECTION_DELAY' | 'FOOD_QUALITY' | 'QUANTITY_MISMATCH' | 'COMMUNICATION' | 'OTHER';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
}

