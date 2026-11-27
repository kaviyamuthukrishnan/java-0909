import {
  AccountStatus,
  AuthSession,
  ProviderOrgType,
  NgoOrgType,
  User,
  UserRole,
  VerificationStatus,
  FoodCategory
} from '../types';
import { apiRequest, isDemoMode, setAccessToken } from './apiClient';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProviderRegistrationPayload {
  organizationName: string;
  organizationType: ProviderOrgType;
  managerName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  operatingHours: string;
  foodCategories: FoodCategory[];
  dailyMealCapacity: number;
  fssaiNumber: string;
}

export interface NgoRegistrationPayload {
  ngoName: string;
  registrationNumber: string;
  organizationType: NgoOrgType;
  contactPerson: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  serviceLocations: string[];
  beneficiaryCount: number;
  dailyMealRequirement: number;
  acceptedCategories: FoodCategory[];
  maxCollectionCapacity: number;
  transportAvailable: boolean;
  transportType: string;
  volunteerCount: number;
  operatingHours: string;
}

interface BackendUserView {
  id: number;
  email: string;
  role: UserRole;
  status: string;
  emailVerified: boolean;
  displayName: string;
  reviewNote?: string | null;
}

interface BackendAuthResponse {
  token: string;
  user: BackendUserView;
}

function mapAccountStatus(status: string): AccountStatus {
  switch (status) {
    case 'APPROVED':
      return 'ACTIVE';
    case 'PENDING_APPROVAL':
      return 'PENDING_VERIFICATION';
    case 'REJECTED':
      return 'REJECTED';
    case 'SUSPENDED':
      return 'SUSPENDED';
    default:
      return 'PENDING_VERIFICATION';
  }
}

function mapVerificationStatus(status: string): VerificationStatus {
  if (status === 'APPROVED') return 'APPROVED';
  if (status === 'REJECTED') return 'REJECTED';
  return 'PENDING_REVIEW';
}

function mapBackendUser(raw: BackendUserView): User {
  const now = new Date().toISOString();

  return {
    id: String(raw.id),
    name: raw.displayName,
    email: raw.email,
    phone: '',
    role: raw.role,
    emailVerified: raw.emailVerified,
    phoneVerified: false,
    accountStatus: mapAccountStatus(raw.status),
    verificationStatus: mapVerificationStatus(raw.status),
    organizationName: raw.role === 'ADMIN' ? undefined : raw.displayName,
    createdAt: now,
    lastActiveAt: now
  };
}

function readJwtExpiry(token: string): string {
  try {
    const part = token.split('.')[1];
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === 'number'
      ? new Date(payload.exp * 1000).toISOString()
      : '';
  } catch {
    return '';
  }
}

let activeDemoOtpRecord: { phone: string; otp: string } | null = null;

function createRandomSixDigitOtp(): string {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return String(100000 + (arr[0] % 900000));
}

function demoUser(
  role: UserRole,
  name: string,
  organizationName: string,
  email: string,
  phone: string
): User {
  const now = new Date().toISOString();

  return {
    id: `demo-${role.toLowerCase()}-${Date.now()}`,
    name,
    organizationName,
    email,
    phone,
    role,
    emailVerified: false,
    phoneVerified: false,
    accountStatus: 'PENDING_VERIFICATION',
    verificationStatus: 'PENDING_REVIEW',
    createdAt: now,
    lastActiveAt: now
  };
}

const providerTypeMap: Record<ProviderOrgType, string> = {
  HOTEL: 'HOTEL',
  RESTAURANT: 'RESTAURANT',
  HOSTEL: 'HOSTEL',
  MESS: 'MESS',
  COLLEGE_CANTEEN: 'CANTEEN',
  BAKERY: 'BAKERY',
  CATERING: 'OTHER'
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const result = await apiRequest<BackendAuthResponse>('/api/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload)
    });

    const user = mapBackendUser(result.user);
    setAccessToken(result.token);

    return {
      user,
      accessToken: result.token,
      tokenType: 'Bearer',
      expiresAt: readJwtExpiry(result.token)
    };
  },

  async registerProvider(payload: ProviderRegistrationPayload): Promise<{
    devVerificationNotice?: string;
    demoOtp?: string;
  }> {
    if (isDemoMode()) {
      const otp = createRandomSixDigitOtp();
      activeDemoOtpRecord = { phone: payload.phone.trim(), otp };

      return {
        demoOtp: otp,
        devVerificationNotice: 'DEMO MODE: Use the displayed demo OTP.'
      };
    }

    await apiRequest<void>('/api/auth/register/provider', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        establishmentName: payload.organizationName,
        ownerName: payload.managerName,
        establishmentType: providerTypeMap[payload.organizationType],
        address: [
          payload.address,
          payload.city,
          payload.district,
          payload.state,
          payload.postalCode
        ].filter(Boolean).join(', '),
        licenceNumber: payload.fssaiNumber || null
      })
    });

    return {
      devVerificationNotice: 'Registration submitted. Check the verification channel configured by the backend for your email OTP.'
    };
  },

  async registerNgo(payload: NgoRegistrationPayload): Promise<{
    devVerificationNotice?: string;
    demoOtp?: string;
  }> {
    if (isDemoMode()) {
      const otp = createRandomSixDigitOtp();
      activeDemoOtpRecord = { phone: payload.phone.trim(), otp };

      return {
        demoOtp: otp,
        devVerificationNotice: 'DEMO MODE: Use the displayed demo OTP.'
      };
    }

    await apiRequest<void>('/api/auth/register/ngo', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        organizationName: payload.ngoName,
        contactName: payload.contactPerson,
        registrationNumber: payload.registrationNumber,
        address: [payload.address, payload.city].filter(Boolean).join(', '),
        beneficiaryCapacity: payload.beneficiaryCount,
        hasTransport: payload.transportAvailable
      })
    });

    return {
      devVerificationNotice: 'Registration submitted. Check the verification channel configured by the backend for your email OTP.'
    };
  },

  async verifyEmail(email: string, code?: string): Promise<{ verified: boolean }> {
    if (isDemoMode()) {
      const enteredCode = code ?? email;
      return { verified: enteredCode.trim().length >= 4 };
    }

    if (!code) {
      throw new Error('Enter your registered email address and OTP code.');
    }

    await apiRequest<void>('/api/auth/verify-email', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, code })
    });

    return { verified: true };
  },

  async resendEmailOtp(email: string): Promise<void> {
    if (isDemoMode()) return;

    await apiRequest<void>('/api/auth/resend-otp', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email })
    });
  },

  resendDemoOtp(phone: string): string | null {
    if (!isDemoMode()) return null;

    const otp = createRandomSixDigitOtp();
    activeDemoOtpRecord = { phone: phone.trim(), otp };
    return otp;
  },

  async verifyPhoneOtp(phone: string, otp: string): Promise<{ verified: boolean }> {
    if (isDemoMode()) {
      if (!activeDemoOtpRecord) return { verified: false };

      const matches =
        activeDemoOtpRecord.phone === phone.trim() &&
        activeDemoOtpRecord.otp === otp.trim();

      if (matches) activeDemoOtpRecord = null;
      return { verified: matches };
    }

    throw new Error(
      'Phone OTP verification is not implemented in the Java backend yet. Please use email verification.'
    );
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    if (isDemoMode()) {
      return {
        message: `DEMO MODE: Password reset simulated for ${email}.`
      };
    }

    throw new Error('Password reset API is not yet implemented in the Java backend.');
  },

  async resetPassword(_token: string, _newPassword: string): Promise<{ message: string }> {
    if (isDemoMode()) {
      return {
        message: 'DEMO MODE: Password reset simulated. No database record was modified.'
      };
    }

    throw new Error('Password reset API is not yet implemented in the Java backend.');
  },

  async getCurrentUser(): Promise<User> {
    const result = await apiRequest<BackendUserView>('/api/auth/me');
    return mapBackendUser(result);
  },

  logout(): void {
    setAccessToken(null);
  }
};
