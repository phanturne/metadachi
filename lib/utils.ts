import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper type to remove 'p_' prefix from object keys
export type RemovePPrefix<T> = {
  [K in keyof T as K extends `p_${infer R}` ? R : K]: T[K];
};
