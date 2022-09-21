import { authOptions } from "./api/auth/[...nextauth]";
import ArchivedPage from "@/pages/ArchivedPage";
import type { ArchivedPageProps } from "@/pages/ArchivedPage";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import type { NextPage } from "types";

const Archived: NextPage<ArchivedPageProps> = (props: ArchivedPageProps) => (
  <ArchivedPage {...props} />
);
Archived.authRequired = true;

export default Archived;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, { id: true });

  const archivedCourses = user
    ? await prisma.course.findMany({
        where: {
          archivedUsers: {
            some: {
              id: user.id,
            },
          },
        },
        select: {
          id: true,
          title: true,
        },
      })
    : [];

  return {
    props: {
      archivedCourses,
    } as ArchivedPageProps,
  };
};
