import ProfilePage from "@/pages/ProfilePage";
import type { ProfilePageProps } from "@/pages/ProfilePage";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

const Profile: NextPage<ProfilePageProps> = (props: ProfilePageProps) => (
  <ProfilePage {...props} />
);

export default Profile;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;
  const user = await prisma.user.findUnique({
    where: { username: username as string },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const currentUser = await getUserSSR(session, { id: true });

  const courses = await prisma.course.findMany({
    where: {
      privacySetting: "ALL",
      owners: {
        some: {
          id: user?.id,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      owners: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return {
    props: JSON.parse(
      JSON.stringify({
        user,
        isSelf: user?.id === currentUser?.id,
        courses,
      })
    ) as ProfilePageProps,
  };
};
