export type VaultMode = 'live' | 'demo' | 'hub';

export type VaultCapabilities = {
  canTogglePinFavorite: boolean;
  canEditContent: boolean;
  canCreateFile: boolean;
  canDeleteFile: boolean;
  canRelocateFile: boolean;
  canResetOverlay: boolean;
  canPublish: boolean;
};

export function getVaultMode(): VaultMode {
  if (process.env.NEXT_PUBLIC_METADACHI_MODE === 'hub') return 'hub';
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'demo' : 'live';
}

export function getVaultCapabilities(mode: VaultMode): VaultCapabilities {
  if (mode === 'demo') {
    return {
      canTogglePinFavorite: true,
      canEditContent: true,
      canCreateFile: true,
      canDeleteFile: true,
      canRelocateFile: true,
      canResetOverlay: true,
      canPublish: false,
    };
  }

  if (mode === 'hub') {
    return {
      canTogglePinFavorite: false,
      canEditContent: false,
      canCreateFile: false,
      canDeleteFile: false,
      canRelocateFile: false,
      canResetOverlay: false,
      canPublish: false,
    };
  }

  return {
    canTogglePinFavorite: true,
    canEditContent: true,
    canCreateFile: true,
    canDeleteFile: true,
    canRelocateFile: true,
    canResetOverlay: false,
    canPublish: true,
  };
}
