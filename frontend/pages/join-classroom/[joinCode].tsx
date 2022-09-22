import { authOptions } from "../api/auth/[...nextauth]";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import type { NextPage } from "types";

const Index: NextPage = () => <div />;
Index.authRequired = true;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { joinCode } = context.query;
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const user = await getUserSSR(session, { id: true });

  if (user) {
    const classroom = await prisma.classroom.findUnique({
      where: {
        joinCode: joinCode as string,
      },
      select: {
        id: true,
      },
    });
    if (classroom) {
      await prisma.classroom.update({
        where: {
          id: classroom.id,
        },
        data: {
          students: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return {
        redirect: {
          destination: `/classroom/${classroom.id}`,
          permanent: false,
        },
      };
    } else {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  } else {
    signIn();
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
