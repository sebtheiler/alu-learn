import apolloClient from "../lib/apollo";
import "../src/atoms/Button/Ripple/Ripple.scss";
import Navbar from "../src/components/Navbar";
import "../src/editor/FullEditable/FullEditable.scss";
import "../styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const isLoggedIn = false;
  const streak = {
    currentStreak: 10,
    doneReviewsToday: true,
  };
  const username = "test";

  return (
    <ApolloProvider client={apolloClient}>
      <Navbar isLoggedIn={isLoggedIn} streak={streak} username={username} />
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
