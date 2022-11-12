import getRequestMetadata from "helpers/getRequestMetadata";
import getServerSession from "helpers/getServerSession";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";

const Index: NextPage = () => <div />;

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { linkCode } = context.query;

  if (typeof linkCode !== "string")
    return {
      notFound: true,
    };

  const link = await prisma.shortUrl.findUnique({
    where: {
      code: linkCode,
    },
    select: {
      destination: true,
    },
  });

  if (!link) {
    return {
      notFound: true,
    };
  } else {
    const session = await getServerSession(context);
    const user = session ? await getUserSSR(session, { id: true }) : undefined;

    const { remoteAddr, userAgent, referer } = getRequestMetadata(context.req);

    await prisma.urlHit.create({
      data: {
        remoteAddr,
        userAgent,
        referer,
        shortUrl: {
          connect: {
            code: linkCode,
          },
        },
        user: user
          ? {
              connect: {
                id: user.id,
              },
            }
          : undefined,
      },
    });

    return {
      redirect: {
        destination: link.destination,
        permanent: false,
      },
    };
  }
};
