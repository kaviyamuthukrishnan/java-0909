export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

let runtimeMockOverride: boolean | null = null;

export function isDemoMode(): boolean {
  if (runtimeMockOverride !== null) return runtimeMockOverride;
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false';
}

export function setRuntimeDemoMode(enabled: boolean): void {
  runtimeMockOverride = enabled;
}

let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth && inMemoryAccessToken) {
    requestHeaders.Authorization = `Bearer ${inMemoryAccessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      `Unable to reach Java Spring Boot backend at ${API_BASE_URL}.`,
      0,
      'BACKEND_UNREACHABLE'
    );
  }

  if (response.status === 401) {
    setAccessToken(null);
    throw new ApiError('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
  }

  const responseText = await response.text();

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errBody = JSON.parse(responseText);
      message = errBody?.message || errBody?.error || message;
    } catch {
      // Keep the default error message if the response is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (!responseText.trim()) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new ApiError(
      'The backend returned an unexpected response.',
      response.status,
      'INVALID_RESPONSE'
    );
  }
}
