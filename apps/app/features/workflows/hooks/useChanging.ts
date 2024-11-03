import { create } from "zustand";

type ChangingState = {
  isChanging: boolean;
  setIsChanging: (isChanging: boolean) => void;
};

export const useChanging = create<ChangingState>((set) => ({
  isChanging: false,
  setIsChanging: (isChanging) => set({ isChanging }),
}));
