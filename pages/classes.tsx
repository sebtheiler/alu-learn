import ClassesPage from "@/pages/ClassesPage";
import type { ClassesPageProps } from "@/pages/ClassesPage";
import getAuthServerSession from "helpers/getAuthServerSession";
import getUserSSR from "helpers/getUserSSR";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Classes: NextPage<ClassesPageProps> = (props) => (
  <ClassesPage {...props} />
);
Classes.authRequired = true;

export default Classes;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await getAuthServerSession(context);
  if (data.props) return data;
  const { session } = data;

  const user = await getUserSSR(session, { id: true });

  const classrooms = await prisma.classroom.findMany({
    where: {
      teachers: {
        some: {
          id: user?.id as string,
        },
      },
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (classrooms.length > 0) {
    return {
      redirect: {
        destination: `/classroom/${classrooms[0].id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      classrooms,
    } as ClassesPageProps,
  };
};
