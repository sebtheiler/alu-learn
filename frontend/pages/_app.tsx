import "../src/atoms/Button/Ripple/Ripple.scss";
import Navbar from "../src/components/Navbar";
import "../src/editor/FullEditable/FullEditable.scss";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const isLoggedIn = false;
  const streak = {
    currentStreak: 10,
    doneReviewsToday: true,
  };
  const username = "test";

  return (
    <div id="root">
      <Navbar isLoggedIn={isLoggedIn} streak={streak} username={username} />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
