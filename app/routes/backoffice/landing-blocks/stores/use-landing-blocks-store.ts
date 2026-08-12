import type { LandingBlock } from 'wle-core';
import { create } from 'zustand';

type LandingBlocksState = {
  blocks: LandingBlock[];
  isLoading: boolean;
  error: string | null;
  setBlocks: (blocks: LandingBlock[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addBlock: (block: LandingBlock) => void;
  updateBlock: (id: number, block: LandingBlock) => void;
  removeBlock: (id: number) => void;
  reorderBlocks: (blocks: LandingBlock[]) => void;
  toggleBlockActive: (id: number) => void;
};

export const useLandingBlocksStore = create<LandingBlocksState>((set) => ({
  blocks: [],
  isLoading: false,
  error: null,

  setBlocks: (blocks) => set({ blocks }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block].sort((a, b) => a.display_order - b.display_order),
    })),

  updateBlock: (id, block) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? block : b)),
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
    })),

  reorderBlocks: (blocks) => set({ blocks }),

  toggleBlockActive: (id) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, is_active: !b.is_active } : b
      ),
    })),
}));