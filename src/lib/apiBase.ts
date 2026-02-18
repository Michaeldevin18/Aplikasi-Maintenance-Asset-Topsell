import { Capacitor } from '@capacitor/core';

export function getApiBaseUrl(): string {
  const apiBaseFromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;

  const isNative = Capacitor.isNativePlatform && Capacitor.isNativePlatform();

  if (isNative) {
    const trimmed = (apiBaseFromEnv || '').trim().replace(/\/$/, '');
    return trimmed || 'https://traemaintenance-asset-appnkeh.vercel.app';
  }

  return '';
}
