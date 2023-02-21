import prisma from "lib/prisma";

/**
 * Expires pro mode for all users with expired trials
 */
const expireProModeTrials = async () => {
  const now = new Date();

  await prisma.user.updateMany({
    where: {
      proTrialExpires: {
        lte: now,
      },
      isProFromOrg: false,
    },
    data: {
      proTrialExpires: null,
      isPro: false,
    },
  });
};

export default expireProModeTrials;
