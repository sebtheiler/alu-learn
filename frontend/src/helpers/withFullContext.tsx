import { GoogleOAuthProvider } from "@react-oauth/google";
// import GlobalContext from "global";
// import { useMemo, useState } from "react";
import type { Story } from "@storybook/react";

/**
 * Storybook decorator that provides full context for all components.
 * `export default { ..., decorators: [withFullContext] }`.
 * Provides React Router, Global, and Google OAuth contexts
 */
export default function withFullContext(Story: Story) {
  // const [registerModalOpen, setRegisterModalOpen] = useState(false);
  // const [logInModalOpen, setSignInModalOpen] = useState(false);
  // const contextVal = useMemo(
  //   () => ({
  //     registerModalOpen,
  //     setRegisterModalOpen,
  //     logInModalOpen,
  //     setSignInModalOpen,
  //   }),
  //   [registerModalOpen, setRegisterModalOpen, logInModalOpen, setSignInModalOpen]
  // );

  return (
    // <GlobalContext.Provider value={contextVal}>
    <GoogleOAuthProvider
      clientId={process.env.GOOGLE_OAUTH_CLIENT_ID as string}
    >
      <Story />
    </GoogleOAuthProvider>
    // </GlobalContext.Provider>
  );
}
