import { ApolloProvider } from "@apollo/client";
import type { Story } from "@storybook/react";
import apolloClient from "lib/apollo";
import { SessionProvider } from "next-auth/react";

/**
 * Storybook decorator that provides full context for all components.
 * `export default { ..., decorators: [withFullContext] }`.
 * Provides React Router, Global, and Google OAuth contexts
 */
export default function withFullContext(Story: Story) {
  return (
    <SessionProvider session={undefined}>
      <ApolloProvider client={apolloClient}>
        <Story />
      </ApolloProvider>
    </SessionProvider>
  );
}
