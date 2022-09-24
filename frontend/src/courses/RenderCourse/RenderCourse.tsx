import CourseSettings from "./CourseSettings";
import CreateCourseSectionButton from "./CreateCourseSectionButton";
import CoursePageContext from "./context";
import ButtonGroup from "@/atoms/ButtonGroup";
import DropdownButton from "@/atoms/DropdownButton";
import LinkButton from "@/atoms/LinkButton";
import RenderCourseSection from "@/courses/RenderCourseSection";
import ArchiveCourse from "@/graphql/ArchiveCourse";
import MoveCourseSection from "@/graphql/MoveCourseSection";
import classNames from "@/helpers/classNames";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import useProStore from "@/stores/proStore";
import type {
  Course,
  Mutation,
  MutationArchiveCourseArgs,
  MutationMoveCourseSectionArgs,
  CourseSection,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import type { SortableEvent } from "react-sortablejs";

type CourseSectionWithId = CourseSection & { id: string };

interface RenderCourseProps {
  course: Course;
  editAccess: boolean;
}

/**
 * Renders a course
 */
export default function RenderCourse({
  course,
  editAccess,
}: RenderCourseProps) {
  const router = useRouter();

  const refreshData = () => router.replace(router.asPath);
  const { width } = useWindowDimensions();
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
  const isPro = useProStore((state) => state.isPro);

  const onCourseSectionDragEnd = (evt: SortableEvent) => {
    if (evt.oldIndex === undefined || evt.newIndex === undefined) return;

    moveCourseSection({
      variables: {
        courseId: course.id as string,
        from: evt.oldIndex,
        to: evt.newIndex,
      },
    });
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
    <div>
      <div className="mx-auto max-w-5xl">
        <div
          className={classNames(
            "w-full relative",
            course.bannerImage ? "h-52" : "h-32"
          )}
        >
          {course.bannerImage && (
            <Image
              src={course.bannerImage ?? "/assets/default-course-banner.png"}
              alt="Course banner"
              layout="fill"
              className="object-cover lg:rounded-xl"
              style={{ zIndex: "-1" }}
            />
          )}
          <div className="w-full h-full flex items-center justify-center">
            <div className="absolute left-3 top-2">
              <Link href="/home">
                <a>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    size="2x"
                    className={course.bannerImage ? "text-white" : "text-black"}
                  />
                </a>
              </Link>
            </div>
            <h1
              className={classNames(
                "font-bold text-4xl text-center",
                course.bannerImage ? "text-white" : "text-black"
              )}
            >
              {course.title}
            </h1>
            {editAccess && (
              <div className="absolute right-0 top-0">
                <CourseSettings course={course} refreshData={refreshData} />
              </div>
            )}
          </div>
        </div>
      </div>
      <ButtonGroup
        className="text-center mt-2"
        fixedWidth="175px"
        vertical={width === 0 ? false : width < 750}
        spaced
      >
        {/* <LinkButton href={`/course/${course.id}/learn`}>
              Learn Content
            </LinkButton> */}
        <LinkButton href={`/course/${course.id}/study`}>Study</LinkButton>
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
            {
              text: "Archive",
              onClick: archiveCourseHandler,
            },
          ]}
        >
          More
        </DropdownButton>
      </ButtonGroup>
      <ReactSortable
        list={courseSections}
        setList={setCourseSections}
        handle=".course-section-drag-handle"
        onEnd={onCourseSectionDragEnd}
        className="md:container mx-auto px-4 mt-6"
      >
        <CoursePageContext.Provider value={{ course, refreshData, editAccess }}>
          {courseSections.map((courseSection) => (
            <RenderCourseSection
              courseSection={courseSection as CourseSection}
              key={courseSection?.id as string}
            />
          ))}
        </CoursePageContext.Provider>
      </ReactSortable>
      <div className="text-center">
        <p className="text-white">.</p>
        {courseSections.length === 0 && (
          <p className="mb-3 mx-auto">
            This course doesn&apos;t have any sections yet. Add one below to
            start organizing the course!
          </p>
        )}
        {editAccess && (
          <CreateCourseSectionButton
            course={course}
            refreshData={refreshData}
          />
        )}
      </div>
    </div>
  );
}
