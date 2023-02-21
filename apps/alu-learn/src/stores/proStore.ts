import { create } from "zustand";

interface ProStoreState {
  isPro: boolean | null;
  setIsPro(isPro: boolean): void;
}

const useProStore = create<ProStoreState>((set) => ({
  isPro: null,
  setIsPro: (isPro) => set((state) => ({ ...state, isPro: isPro })),
}));

export default useProStore;
