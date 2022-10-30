import daysBetween from "@/helpers/daysBetween";
import createEmailTemplate from "emails/createEmailTemplate";
import sendEmail from "emails/sendEmail";
import prisma from "lib/prisma";

/**
 * Schedules how many days after a user signs up will emails be sent
 * 2: HOPING_TO_GET -> Hoping to get email is sent two days after the user signs up
 */
const EMAIL_ORDER = {
  1: "HOPING_TO_GET",
  3: "GET_THE_MOST",
  6: "USERS_SCORE_HIGHER",
  10: "HOW_ALU_HELPS",
};

const EMAIL_INFO = {
  HOPING_TO_GET: {
    template: createEmailTemplate("hopingToGet"),
    title: "What Are You Hoping to Get?",
    subject: "What Are You Hoping to Get Out of Alu?",
  },
  GET_THE_MOST: {
    template: createEmailTemplate("getTheMost"),
    title: "How to Get the Most Out of Alu",
    subject: "How to Get The Most Out of Alu",
  },
  USERS_SCORE_HIGHER: {
    template: createEmailTemplate("usersScoreHigher"),
    title: "Did You Know Alu Benefits 96% of Users?",
    subject: "Did You Know Alu Benefits 96% of Users?",
  },
  HOW_ALU_HELPS: {
    template: createEmailTemplate("howAluHelps"),
    title: "3 Ways Alu Helps You",
    subject: "3 Ways Alu Helps You",
  },
};

/**
 * Sends a series of emails after users sign up
 */
const sendScheduledEmails = async () => {
  const users = await prisma.user.findMany({
    select: {
      createdAt: true,
      email: true,
      name: true,
    },
    where: {
      sendGeneral: true,
      unsubscribeAll: false,
      userType: "STUDENT",
    },
  });

  for (const user of users) {
    if (!user.email) continue;
    const daysSinceSignup = Math.floor(daysBetween(user.createdAt, new Date()));

    const emailIdToSend = EMAIL_ORDER[daysSinceSignup];
    if (emailIdToSend) {
      const name = user.name?.split(" ")[0];
      const { template, title, subject } = EMAIL_INFO[emailIdToSend];

      sendEmail({
        to: user.email,
        subject,
        html: template({
          title,
          name,
        }),
      });
    }
  }
};

export default sendScheduledEmails;
