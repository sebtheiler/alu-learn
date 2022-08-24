import createContext from "../../graphql/context";
import schema from "../../graphql/schema";
import { ApolloServer } from "apollo-server-micro";
import processRequest from "graphql-upload/processRequest.mjs";
import Cors from "micro-cors";

const cors = Cors();

const apolloServer = new ApolloServer({
  schema,
  context: createContext,
  csrfPrevention: true,
});

const startServer = apolloServer.start();

export default cors(async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  // See https://github.com/jaydenseric/graphql-upload/issues/216#issuecomment-1146063052
  const contentType = req.headers["content-type"];
  if (contentType && contentType.startsWith("multipart/form-data")) {
    // @ts-ignore
    req.filePayload = await processRequest(req, res);
  }

  await startServer;

  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
