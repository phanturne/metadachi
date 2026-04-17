export type VaultMode = 'live' | 'demo';

export type VaultCapabilities = {
  canTogglePinFavorite: boolean;
  canEditContent: boolean;
  canCreateFile: boolean;
  canDeleteFile: boolean;
  canRelocateFile: boolean;
  canResetOverlay: boolean;
};

export function getVaultMode(): VaultMode {
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
    };
  }

  return {
    canTogglePinFavorite: true,
    canEditContent: true,
    canCreateFile: true,
    canDeleteFile: true,
    canRelocateFile: true,
    canResetOverlay: false,
  };
}
