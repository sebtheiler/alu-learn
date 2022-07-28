import { objectType, enumType, extendType } from "nexus";

const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("username");
    t.string("name");
    t.string("email");
    t.field("role", { type: Role });
    t.field("userType", { type: UserType });
    // t.field('signupSurvey', {
    //   type: 'SignupSurvey'
    // })
  },
});

export const UsersQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("users", {
      type: User,
      resolve(_parent, _args, ctx) {
        return ctx.prisma.user.findMany();
      },
    });
  },
});

export const Role = enumType({
  name: "Role",
  members: ["USER", "STAFF", "ADMIN"],
});

export const UserType = enumType({
  name: "UserType",
  members: ["STUDENT", "TEACHER", "MIXED"],
});

export default User;
