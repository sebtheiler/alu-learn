import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

interface GlobalContextInterface {
  registerModalOpen: boolean;
  setRegisterModalOpen?: Dispatch<SetStateAction<boolean>>;
  logInModalOpen: boolean;
  setSignInModalOpen?: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = createContext({
  registerModalOpen: false,
  setRegisterModalOpen: undefined,
  logInModalOpen: false,
  setSignInModalOpen: undefined,
} as GlobalContextInterface);
export default GlobalContext;
