import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}