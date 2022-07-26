import { createContext } from "react";

import type { Dispatch, SetStateAction } from "react";

interface GlobalContextInterface {
  signUpModalOpen: boolean;
  setSignUpModalOpen?: Dispatch<SetStateAction<boolean>>;
  logInModalOpen: boolean;
  setLogInModalOpen?: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = createContext({
  signUpModalOpen: false,
  setSignUpModalOpen: undefined,
  logInModalOpen: false,
  setLogInModalOpen: undefined,
} as GlobalContextInterface);
export default GlobalContext;
