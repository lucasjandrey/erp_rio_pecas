import axios from 'axios';

const tokenStorageKey = import.meta.env.VITE_AUTH_STORAGE_KEY || 'rio_pecas_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function ensureAuth() {
  const existing = localStorage.getItem(tokenStorageKey);
  if (existing) return existing;

  const auth = await api.post('/auth/login', {
    email: import.meta.env.VITE_AUTH_EMAIL || 'admin@riopecas.local',
    password: import.meta.env.VITE_AUTH_PASSWORD || 'admin123',
  });

  localStorage.setItem(tokenStorageKey, auth.data.token);
  return auth.data.token as string;
}
