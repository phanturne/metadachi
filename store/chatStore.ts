import { create } from 'zustand';

interface ChatState {
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  clearSelectedFiles: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedFiles: [],
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  clearSelectedFiles: () => set({ selectedFiles: [] }),
}));
