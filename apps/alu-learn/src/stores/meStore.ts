import type { Query } from "@/types";
import { create } from "zustand";

interface MeStoreState {
  me: Query["me"] | null;
  setMe(me: Query["me"]): void;
}

const useMeStore = create<MeStoreState>((set) => ({
  me: null,
  setMe: (me) => set((state) => ({ ...state, me })),
}));

export default useMeStore;
