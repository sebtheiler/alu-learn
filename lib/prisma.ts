import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}
export default prisma;

// Middleware
const partneredDomains = JSON.parse(process.env.PARTNERED_DOMAINS as string);

async function main() {
  prisma.$use(async (params, next) => {
    if (params.model === "User") {
      if (params.action === "create") {
        // Generate a username for the user if one is not specified
        if (!params.args.data.username) {
          let newUsernameBase = "user";
          try {
            if (params.args.data.name) {
              newUsernameBase = params.args.data.name
                .toLowerCase()
                .replaceAll(" ", "");
            } else if (params.args.data.email) {
              newUsernameBase = params.args.email.split("@")[0].toLowerCase();
            }
          } catch {
            newUsernameBase = "user";
          }

          let newUsername = newUsernameBase;
          while (
            (await prisma.user.count({ where: { username: newUsername } })) > 0
          ) {
            newUsername =
              newUsernameBase + Math.floor(Math.random() * 1000).toString();
          }
          params.args.data.username = newUsername;
        }

        // If no name is specified, default to using their email as a name
        if (!params.args.data.name) {
          if (params.args.email) {
            params.args.data.name = params.args.email
              .split("@")[0]
              .toLowerCase();
          } else {
            params.args.data.name = "User";
          }
        }

        // If the user is from a partnered organization, give them pro mode
        const email = params.args.data.email;
        if (email) {
          const emailDomain = email.split("@").pop();
          if (partneredDomains.includes(emailDomain)) {
            params.args.data.isPro = true;
            params.args.data.isProFromOrg = true;
          }
        }
      }
    }

    return next(params);
  });
}

main();
