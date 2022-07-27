import "../src/atoms/Button/Ripple/Ripple.scss";
import Navbar from "../src/components/Navbar";
import "../src/editor/FullEditable/FullEditable.scss";
import GlobalContext from "../src/global";
import "../styles/LandingPage.scss";
import "../styles/ProUpgradePage.scss";
import "../styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { AppProps } from "next/app";
import { useContext, useMemo, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
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

  const isLoggedIn = false;
  const streak = {
    currentStreak: 10,
    doneReviewsToday: true,
  };
  const username = "test";

  console.log(contextVal);

  return (
    <GoogleOAuthProvider
      clientId={process.env.GOOGLE_OAUTH_CLIENT_ID as string}
    >
      <GlobalContext.Provider value={contextVal}>
        <Navbar isLoggedIn={isLoggedIn} streak={streak} username={username} />
        <Component {...pageProps} />
        <Foo />
      </GlobalContext.Provider>
    </GoogleOAuthProvider>
  );
}

function Foo() {
  console.log("****************", useContext(GlobalContext));
  return <p>swasd</p>;
}

export default MyApp;
