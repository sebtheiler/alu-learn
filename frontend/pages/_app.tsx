import apolloClient from "../lib/apollo";
import "../src/atoms/Button/Ripple/Ripple.scss";
import Navbar from "../src/components/Navbar";
import "../src/editor/FullEditable/FullEditable.scss";
import "../styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import type { NextComponentType, NextPageContext } from "next";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

type AppProps = {
  // eslint-disable-next-line
  pageProps: any;
  // eslint-disable-next-line
  Component: NextComponentType<NextPageContext, any, {}> & {
    authRequired?: boolean;
  };
};

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const streak = {
    currentStreak: 10,
    doneReviewsToday: true,
  };
  const username = "test";

  return (
    <SessionProvider session={session}>
      <ApolloProvider client={apolloClient}>
        <Navbar streak={streak} username={username} />
        {Component.authRequired ? (
          <Auth>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}
      </ApolloProvider>
    </SessionProvider>
  );
}

interface AuthProps {
  children: React.ReactElement;
}
function Auth({ children }: AuthProps): React.ReactElement | null {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;

  useEffect(() => {
    if (status === "loading") return;
    if (!isUser) signIn();
  }, [isUser, status]);

  if (isUser) {
    return children;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>;
}

export default App;
