import apolloClient from "../lib/apollo";
import "../styles/globals.css";
import Auth from "./_auth";
import Layout from "./_layout";
import { ApolloProvider } from "@apollo/client";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { NextComponentType, NextPageContext } from "next";
import { SessionProvider } from "next-auth/react";

type AppProps = {
  // eslint-disable-next-line
  pageProps: any;
  // eslint-disable-next-line
  Component: NextComponentType<NextPageContext, any, {}> & {
    authRequired?: boolean;
  };
};

function App({
  Component,
  pageProps: { session, streak, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={apolloClient}>
        <Layout session={session} streak={streak}>
          {Component.authRequired ? (
            <Auth>
              <Component {...pageProps} />
            </Auth>
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
      </ApolloProvider>
    </SessionProvider>
  );
}

export default App;
