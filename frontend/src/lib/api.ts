/**
 * Thin fetch wrapper around the Task Manager API.
 * Unwraps the `{ success, message, data, meta }` envelope and turns every
 * failure (network, HTTP, validation) into a typed `ApiError`.
 */

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly details?: ApiErrorDetail[];

  constructor(status: number, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: unknown;
}

interface ApiFailEnvelope {
  success: false;
  message?: string;
  details?: ApiErrorDetail[];
}

interface ApiResult<T> {
  data: T;
  message: string;
  meta?: unknown;
}

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');

const FALLBACK_MESSAGES: Record<number, string> = {
  0: 'Cannot reach the server. Check that the API is running and try again.',
  400: 'The request was invalid.',
  404: 'The requested resource was not found.',
  500: 'The server ran into a problem. Please try again.',
};

function isFailEnvelope(payload: unknown): payload is ApiFailEnvelope {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as ApiFailEnvelope).success === false
  );
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, FALLBACK_MESSAGES[0]);
  }

  const payload: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok || payload === null || isFailEnvelope(payload)) {
    const fail = isFailEnvelope(payload) ? payload : null;
    const message =
      fail?.message ?? FALLBACK_MESSAGES[response.status] ?? 'Something went wrong. Please try again.';
    const details = fail?.details && fail.details.length > 0 ? fail.details : undefined;

    throw new ApiError(response.status, message, details);
  }

  const envelope = payload as ApiEnvelope<T>;
  return { data: envelope.data, message: envelope.message, meta: envelope.meta };
}
