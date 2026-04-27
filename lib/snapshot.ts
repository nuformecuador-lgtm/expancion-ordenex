// Lee el snapshot estático generado por `npm run snapshot`.
// Esto permite deployar a Vercel sin envs y servir datos reales.
import snapshotJson from '@/data/snapshot.json';
import type { DashboardData } from './types';

export function loadSnapshot(): DashboardData {
  return snapshotJson as unknown as DashboardData;
}

export function hasSnapshot(): boolean {
  return !!(snapshotJson as { generatedAt?: string })?.generatedAt;
}
