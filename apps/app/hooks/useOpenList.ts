import { create } from "zustand";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useOpenList = create<Props>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
