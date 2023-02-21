import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: createUploadLink({
    uri: "/api/graphql",
    credentials: "include",
    // headers: {
    //   "apollo-require-preflight": true,
    // },
  }),
});

export default apolloClient;
