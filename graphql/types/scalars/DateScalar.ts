import { Kind } from "graphql";
import { scalarType } from "nexus";

const DateScalar = scalarType({
  name: "Date",
  asNexusMethod: "date",
  description: "Date scalar type",
  parseValue(value) {
    return new Date(value as string | number);
  },
  serialize(value) {
    return (value as Date).getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  },
});
export default DateScalar;
