import type { PrismaClient } from "@prisma/client";

const friendUsers = async (
  meId: string,
  otherId: string,
  prisma: PrismaClient
) => {
  await prisma.user.update({
    where: {
      id: meId,
    },
    data: {
      friends: {
        connect: {
          id: otherId,
        },
      },
      friendsRequested: {
        disconnect: {
          id: otherId,
        },
      },
    },
  });

  await prisma.user.update({
    where: {
      id: otherId,
    },
    data: {
      friends: {
        connect: {
          id: meId,
        },
      },
    },
  });
};

export default friendUsers;
