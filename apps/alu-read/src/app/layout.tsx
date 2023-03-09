"use client";
import { useState } from "react";
import { trpc, trpcFetch } from "./util";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalContext } from "./globalContext";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import superjson from "superjson";
import type { MergedObject } from "../../types";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedObject, setSelectedObject] =
    useState<Partial<MergedObject> | null>(null);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink(),
        httpBatchLink({
          url: "/trpc",
          fetch: trpcFetch,
        }),
      ],
      transformer: superjson,
    })
  );

  return (
    <html>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ApolloProvider client={apolloClient}>
              <GlobalContext.Provider
                value={{ selectedObject, setSelectedObject }}
              >
                {children}
              </GlobalContext.Provider>
            </ApolloProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </body>
    </html>
  );
}
