'use client';

import { useState } from 'react';

export function Sources() {
  const [files, setFiles] = useState<string[]>([]);

  return (
    <div className="h-full p-4">
      <h2 className="font-semibold mb-4">Sources</h2>
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No files uploaded yet. Upload files to get started.
        </p>
      ) : (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={i} className="text-sm cursor-pointer hover:text-primary">
              {file}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
