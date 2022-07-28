import create from "zustand";

interface GlobalModalState {
  registerModalOpen: boolean;
  setRegisterModalOpen(open: boolean): void;
  logInModalOpen: boolean;
  setSignInModalOpen(open: boolean): void;
}

const useGlobalModalStore = create<GlobalModalState>((set) => ({
  registerModalOpen: false,
  setRegisterModalOpen: (open) =>
    set((state) => ({ ...state, registerModalOpen: open })),
  logInModalOpen: false,
  setSignInModalOpen: (open) =>
    set((state) => ({ ...state, logInModalOpen: open })),
}));

export default useGlobalModalStore;
