import CourseSettings from "./CourseSettings";
import CreateCourseSectionButton from "./CreateCourseSectionButton";
import CoursePageContext from "./context";
import ButtonGroup from "@/atoms/ButtonGroup";
import DropdownButton from "@/atoms/DropdownButton";
import LinkButton from "@/atoms/LinkButton";
import RenderCourseSection from "@/courses/RenderCourseSection";
import ArchiveCourse from "@/graphql/ArchiveCourse";
import CalculateSubSectionsPercentComplete from "@/graphql/CalculateSubSectionsPercentComplete";
import MoveCourseSection from "@/graphql/MoveCourseSection";
import classNames from "@/helpers/classNames";
import useProStore from "@/stores/proStore";
import type {
  Course,
  Mutation,
  MutationArchiveCourseArgs,
  MutationMoveCourseSectionArgs,
  CourseSection,
  AssignmentWithSubSections,
  Classroom,
  Query,
} from "@/types";
import { useMutation, useQuery } from "@apollo/client";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import type { SortableEvent } from "react-sortablejs";

type CourseSectionWithId = CourseSection & { id: string };

interface RenderCourseProps {
  course: Course;
  editAccess: boolean;
  assignments?: AssignmentWithSubSections[];
  classroom?: Classroom;
}

/**
 * Renders a course
 */
export default function RenderCourse({
  course,
  editAccess,
  assignments,
  classroom,
}: RenderCourseProps) {
  const router = useRouter();
  const refreshData = () => router.replace(router.asPath);
  const session = useSession();

  // When `refreshData` reloads the course, we need to manually update
  // the internal statee
  useEffect(() => {
    setCourseSections(course.courseSections as CourseSectionWithId[]);
  }, [course.courseSections]);

  const [courseSections, setCourseSections] = useState<CourseSectionWithId[]>(
    course.courseSections as CourseSectionWithId[]
  );
  const [moveCourseSection] = useMutation<
    { moveCourseSection: Mutation["moveCourseSection"] },
    MutationMoveCourseSectionArgs
  >(MoveCourseSection);
  const [archiveCourse] = useMutation<
    { archiveCourse: Mutation["archiveCourse"] },
    MutationArchiveCourseArgs
  >(ArchiveCourse);
  const [collapseCourseSections, setCollapseCourseSections] = useState(false);
  const isPro = useProStore((state) => state.isPro);

  const { data: percentComplete } = useQuery<{
    calculateSubSectionsPercentComplete: Query["calculateSubSectionsPercentComplete"];
  }>(CalculateSubSectionsPercentComplete, {
    variables: {
      subSectionIds: courseSections.flatMap((courseSection) =>
        courseSection.subSections?.map((subSection) => subSection?.id)
      ),
    },
  });

  const onCourseSectionDragEnd = (evt: SortableEvent) => {
    if (evt.oldIndex === undefined || evt.newIndex === undefined) return;

    moveCourseSection({
      variables: {
        courseId: course.id as string,
        from: evt.oldIndex,
        to: evt.newIndex,
      },
    });

    setCollapseCourseSections(false);
  };

  const archiveCourseHandler = async (e: React.MouseEvent) => {
    e.preventDefault();

    await archiveCourse({
      variables: {
        courseId: course.id as string,
        archive: true,
      },
    });

    router.push("/archived");
  };
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12 xl:col-span-3">
        <div className="sticky top-24 w-full px-2">
          <div
            className={classNames(
              "relative w-full md:max-w-xl mx-auto",
              course.bannerImage && "py-10"
            )}
          >
            {course.bannerImage && (
              <Image
                src={course.bannerImage}
                alt="Course banner"
                layout="fill"
                className="object-cover md:rounded-xl"
                style={{ zIndex: "-1" }}
              />
            )}
            <div
              className={classNames(
                "absolute left-3",
                course.bannerImage ? "top-5" : "top-1"
              )}
            >
              <Link
                href={
                  session.status === "unauthenticated" ? "/explore" : "/home"
                }
              >
                <a>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    size="2x"
                    className={course.bannerImage ? "text-white" : "text-black"}
                  />
                </a>
              </Link>
            </div>
            {editAccess && (
              <div
                className={classNames(
                  "absolute left-3",
                  course.bannerImage ? "top-16" : "top-10"
                )}
              >
                <CourseSettings course={course} refreshData={refreshData} />
              </div>
            )}
            <h1
              className={classNames(
                "text-4xl font-bold text-center px-12",
                course.bannerImage ? "text-white" : "text-black"
              )}
            >
              {course.title}
            </h1>
          </div>
          <hr className="max-w-xs mx-auto my-5" />
          <ButtonGroup
            className="text-center mt-2"
            fixedWidth="250px"
            vertical
            spaced
          >
            <LinkButton href={`/course/${course.id}/study`}>
              Study All
            </LinkButton>
            <LinkButton href={`/course/${course.id}/flashcards`}>
              View Flashcards
            </LinkButton>
            {/* <LinkButton href={`/course/${course.id}/study-group`}>
                  Study Group
                </LinkButton> */}
            <LinkButton
              href={`/course/${course.id}/games`}
              disabled={!isPro}
              title={!isPro ? "Upgrade to pro to play games" : ""}
            >
              Games
            </LinkButton>
            <DropdownButton
              options={[
                {
                  text: "Tools",
                  href: `/course/${course?.id}/tools`,
                },
                ...(classroom
                  ? []
                  : [
                      {
                        text: "Archive",
                        onClick: archiveCourseHandler,
                      },
                    ]),
              ]}
            >
              More
            </DropdownButton>
          </ButtonGroup>
        </div>
      </div>
      <div className="col-span-12 mt-5 xl:col-span-6">
        <ReactSortable
          list={courseSections}
          setList={setCourseSections}
          handle=".course-section-drag-handle"
          onEnd={onCourseSectionDragEnd}
          onStart={() => setCollapseCourseSections(true)}
        >
          <CoursePageContext.Provider
            value={{ course, refreshData, editAccess, percentComplete }}
          >
            {courseSections.map((courseSection) => (
              <RenderCourseSection
                courseSection={courseSection as CourseSection}
                collapsedSubSections={collapseCourseSections}
                assignedSubSectionIds={assignments?.flatMap((assignment) =>
                  assignment.assignedSubSections.map((ss) => ss.id as string)
                )}
                key={courseSection?.id as string}
              />
            ))}
          </CoursePageContext.Provider>
        </ReactSortable>
        <div className="text-center">
          {courseSections.length === 0 && (
            <p className="mb-3 mx-auto">
              This course doesn&apos;t have any sections yet. Add one below to
              start organizing the course!
            </p>
          )}
          {editAccess && (
            <div className="flex justify-center w-full">
              <CreateCourseSectionButton
                course={course}
                refreshData={refreshData}
              />
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 xl:col-span-3">
        <div className="sticky top-24 max-w-xs mx-auto">
          {assignments && (
            <div className="px-2 overflow-hidden">
              <h2 className="text-center font-bold text-2xl">Assignments</h2>
              {assignments.map((assignment) => (
                <Link
                  href={`/classroom/${classroom?.id}/study/${assignment.id}`}
                  key={assignment.id}
                >
                  <a>
                    <div className="my-3 px-3 py-2 border-2 rounded-xl hover:scale-105 transition">
                      <h3 className="font-bold text-lg">{assignment.title}</h3>
                      <ul className="ml-8">
                        {assignment.assignedSubSections.map((subSection) => (
                          <li key={subSection.id}>{subSection.title}</li>
                        ))}
                      </ul>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
