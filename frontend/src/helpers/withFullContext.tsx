import GlobalContext from "global";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";

/**
 * Storybook decorator that provides full context for all components.
 * `export default { ..., decorators: [withFullContext] }`.
 * Provides React Router, Global, and Google OAuth contexts
 */
export default function withFullContext(Story) {
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [logInModalOpen, setLogInModalOpen] = useState(false);
  const contextVal = useMemo(
    () => ({
      signUpModalOpen,
      setSignUpModalOpen,
      logInModalOpen,
      setLogInModalOpen,
    }),
    [signUpModalOpen, setSignUpModalOpen, logInModalOpen, setLogInModalOpen]
  );

  return (
    <BrowserRouter>
      <GlobalContext.Provider value={contextVal}>
        <GoogleOAuthProvider
          clientId={process.env.GOOGLE_OAUTH_CLIENT_ID as string}
        >
          <Story />
        </GoogleOAuthProvider>
      </GlobalContext.Provider>
    </BrowserRouter>
  );
}
