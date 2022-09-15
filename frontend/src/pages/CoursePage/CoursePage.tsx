import CourseSettings from "./CourseSettings";
import CreateCourseSectionButton from "./CreateCourseSectionButton";
import CoursePageContext from "./context";
import ButtonGroup from "@/atoms/ButtonGroup";
import DropdownButton from "@/atoms/DropdownButton";
import LinkButton from "@/atoms/LinkButton";
import RenderCourseSection from "@/courses/RenderCourseSection";
import MoveCourseSection from "@/graphql/MoveCourseSection";
import SEO from "@/helpers/SEO";
import classNames from "@/helpers/classNames";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import type {
  Course,
  CourseSection,
  Mutation,
  MutationMoveCourseSectionArgs,
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

export interface CoursePageProps {
  /**
   * Course to display
   */
  course: Course;
  /**
   * Is the user authorized to view the course? (course is null if true)
   */
  authorized: boolean;
}

/**
 * Renders the page for a course, with all of its course sections and sub sections
 */
export default function CoursePage({ course, authorized }: CoursePageProps) {
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

  return (
    <>
      <SEO
        title={course?.title ?? "Course"}
        path={`course/${course?.id}`}
        // TODO: Add SEO description (VERY IMPORTANT)
        description=""
      />
      {authorized && (
        <div className="mt-28">
          <div className="mx-auto max-w-5xl">
            <div
              className={classNames(
                "w-full relative",
                course.bannerImage ? "h-52" : "h-32"
              )}
            >
              {course.bannerImage && (
                <Image
                  src={
                    course.bannerImage ?? "/assets/default-course-banner.png"
                  }
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
                        className={
                          course.bannerImage ? "text-white" : "text-black"
                        }
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
                <div className="absolute right-0 top-0">
                  <CourseSettings course={course} refreshData={refreshData} />
                </div>
              </div>
            </div>
          </div>
          <ButtonGroup
            className="text-center mt-2"
            fixedWidth="175px"
            vertical={width < 750}
            spaced
          >
            <LinkButton href={`/course/${course.id}/learn`}>
              Learn Content
            </LinkButton>
            <LinkButton href={`/course/${course.id}/flashcards`}>
              All Flashcards
            </LinkButton>
            <LinkButton href={`/course/${course.id}/study-group`}>
              Study Group
            </LinkButton>
            <DropdownButton
              options={[
                {
                  text: "Games",
                  href: `/course/${course?.id}/games`,
                },
                {
                  text: "Practice Problems",
                  href: `/course/${course?.id}/practice`,
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
            <CoursePageContext.Provider value={{ course, refreshData }}>
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
            <CreateCourseSectionButton
              course={course}
              refreshData={refreshData}
            />
          </div>
        </div>
      )}
      {!authorized && (
        <div className="mt-28 text-center">
          <p>You are not authorized to view this course</p>
        </div>
      )}
    </>
  );
}
