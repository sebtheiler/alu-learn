import { GraphQLError } from "graphql";
import { scalarType } from "nexus";

export const Upload = scalarType({
  name: "Upload",
  asNexusMethod: "upload", // We set this to be used as a method later as `t.upload()` if needed
  description: "The `Upload` scalar type represents a file upload.",
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    throw new GraphQLError("Upload literal unsupported.", ast);
  },
  serialize() {
    throw new GraphQLError("Upload serialization unsupported.");
  },
});
