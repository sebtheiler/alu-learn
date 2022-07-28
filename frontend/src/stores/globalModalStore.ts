import create from "zustand";

interface GlobalModalState {
  signUpModalOpen: boolean;
  setSignUpModalOpen(open: boolean): void;
  logInModalOpen: boolean;
  setLogInModalOpen(open: boolean): void;
}

const useGlobalModalStore = create<GlobalModalState>((set) => ({
  signUpModalOpen: false,
  setSignUpModalOpen: (open) =>
    set((state) => ({ ...state, signUpModalOpen: open })),
  logInModalOpen: false,
  setLogInModalOpen: (open) =>
    set((state) => ({ ...state, logInModalOpen: open })),
}));

export default useGlobalModalStore;
