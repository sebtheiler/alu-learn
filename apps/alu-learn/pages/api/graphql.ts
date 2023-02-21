import schema from "graphql/schema";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import createContext from "graphql/context";

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
});

const handler = startServerAndCreateNextHandler(server, {
  context: createContext,
});
export default handler;
