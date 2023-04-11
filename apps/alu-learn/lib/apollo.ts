import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import https from "https";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: createUploadLink({
    uri: "/api/graphql",
    credentials: "include",
    fetchOptions: {
      agent: new https.Agent({ rejectUnauthorized: false }),
    },
    // headers: {
    //   "apollo-require-preflight": true,
    // },
  }),
});

export default apolloClient;
