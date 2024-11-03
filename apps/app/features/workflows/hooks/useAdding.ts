import { create } from "zustand";

type AddingState = {
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
};

export const useAdding = create<AddingState>((set) => ({
  isAdding: false,
  setIsAdding: (isAdding) => set({ isAdding }),
}));
