import { ApolloError, ApolloServer } from "apollo-server-micro";
import {
  createComplexityRule,
  simpleEstimator,
} from "graphql-query-complexity";
import processRequest from "graphql-upload/processRequest.mjs";
import createContext from "graphql/context";
import schema from "graphql/schema";
import Cors from "micro-cors";

const cors = Cors();

// Prevent GraphQL queries from being too complex and DOSing the server
const complexityRule = createComplexityRule({
  // The maximum allowed query complexity, queries above this threshold will be rejected
  maximumComplexity: 100,

  // Optional callback function to retrieve the determined query complexity
  // Will be invoked whether the query is rejected or not
  // This can be used for logging or to implement rate limiting
  // onComplete: (complexity: number) => {console.log('Determined query complexity: ', complexity)},

  // Optional function to create a custom error
  createError: (max: number, actual: number) => {
    return new ApolloError(
      `Query is too complex: ${actual}. Maximum allowed complexity: ${max}`
    );
  },

  // Add any number of estimators. The estimators are invoked in order, the first
  // numeric value that is being returned by an estimator is used as the field complexity.
  // If no estimator returns a value, an exception is raised.
  estimators: [
    // This will assign each field a complexity of 1 if no other estimator
    // returned a value.
    simpleEstimator({
      defaultComplexity: 1,
    }),
  ],
});

const apolloServer = new ApolloServer({
  schema,
  context: createContext,
  csrfPrevention: true,
  validationRules: [complexityRule],
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
