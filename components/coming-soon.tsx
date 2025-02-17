'use client';

import { AppHeader } from '@/components/app-header';

export default function ComingSoon() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader />

      <div className="flex flex-1 items-center justify-center rounded-md">
        <div className="max-w-2xl">
          <h1 className="text-center font-bold text-4xl md:text-7xl">
            Coming Soon
          </h1>
          <p className="mx-auto my-2 max-w-lg text-center">
            Get ready, something awesome is just around the corner!
          </p>
        </div>
      </div>
    </div>
  );
}
