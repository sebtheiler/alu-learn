import create from "zustand";

interface GlobalModalState {
  registerModalOpen: boolean;
  setRegisterModalOpen(open: boolean): void;
  signInModalOpen: boolean;
  setSignInModalOpen(open: boolean): void;
}

const useGlobalModalStore = create<GlobalModalState>((set) => ({
  registerModalOpen: false,
  setRegisterModalOpen: (open) =>
    set((state) => ({ ...state, registerModalOpen: open })),
  signInModalOpen: false,
  setSignInModalOpen: (open) =>
    set((state) => ({ ...state, signInModalOpen: open })),
}));

export default useGlobalModalStore;
