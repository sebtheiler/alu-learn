import IconTooltip from "alu-ui/src/IconTooltip";
import ArchiveCourse from "graphql-operations/operations/ArchiveCourse";
import SEO from "@/helpers/SEO";
import type { Course, Mutation, MutationArchiveCourseArgs } from "@/types";
import { useMutation } from "@apollo/client";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";

export interface ArchivedPageProps {
  archivedCourses: Course[];
}

/**
 *
 */
export default function ArchivedPage({ archivedCourses }: ArchivedPageProps) {
  const router = useRouter();
  const [archiveCourse] = useMutation<
    { archiveCourse: Mutation["archiveCourse"] },
    MutationArchiveCourseArgs
  >(ArchiveCourse);

  const unarchiveCourse = (courseId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    await archiveCourse({
      variables: {
        courseId,
        archive: false,
      },
    });
    router.push(`/course/${courseId}`);
  };

  return (
    <>
      <SEO
        title="Archived"
        path="archived"
        description="View your archived courses and classes in Alu Learn"
      />
      <div className="mt-28">
        <h1 className="text-4xl font-bold text-center">Archived</h1>
        <h3 className="text-2xl font-bold text-center mt-5 mb-3">Courses</h3>
        {archivedCourses.map((course) => (
          <div
            key={course.id}
            className="max-w-md mx-auto py-3 px-4 bg-gray-100 border-2 border-gray-200 rounded-lg my-4"
          >
            <Link href={`/course/${course.id}`} className="text-blue-600">
              {course.title}
            </Link>
            <IconTooltip
              faIcon={faBoxArchive}
              onClick={unarchiveCourse(course.id as string)}
              className="float-right text-gray-700"
              title="Unarchive"
            />
          </div>
        ))}
      </div>
    </>
  );
}
