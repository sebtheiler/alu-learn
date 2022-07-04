import { createContext } from 'react';

const GlobalContext = createContext({
  signUpModalOpen: false,
  setSignUpModalOpen: undefined,
  logInModalOpen: false,
  setLogInModalOpen: undefined,
});
export default GlobalContext;
