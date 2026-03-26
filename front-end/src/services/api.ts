const viteEnv = (import.meta as ImportMeta)?.env as Record<string, string> | undefined;
export const API_BASE_URL = viteEnv?.VITE_API_URL ?? 'http://localhost:3000/api';

interface HttpError extends Error {
  status?: number;
  data?: unknown;
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || `HTTP ${res.status}`;
    const error: HttpError = new Error(`${res.status} ${message}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data as T;
}
