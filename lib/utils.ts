import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format to 1 decimal place for KB, MB, GB, but no decimals for bytes
  const value = i === 0 ? bytes : bytes / Math.pow(k, i);
  const formattedValue = i === 0 ? value : value.toFixed(1);

  return `${formattedValue} ${units[i]}`;
}
