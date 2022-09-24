import "../styles/globals.css";
import Auth from "./_auth";
import Layout from "./_layout";
import { ApolloProvider } from "@apollo/client";
import "@fortawesome/fontawesome-svg-core/styles.css";
import apolloClient from "lib/apollo";
import type { NextComponentType, NextPageContext } from "next";
import { SessionProvider } from "next-auth/react";
import { GoogleAnalytics } from "nextjs-google-analytics";

type AppProps = {
  pageProps: any;
  // eslint-disable-next-line
  Component: NextComponentType<NextPageContext, any, {}> & {
    authRequired?: boolean;
    proRequired?: boolean;
  };
};

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={apolloClient}>
        <Layout session={session}>
          <GoogleAnalytics trackPageViews />
          {Component.authRequired ? (
            <Auth proRequired={Component.proRequired}>
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
