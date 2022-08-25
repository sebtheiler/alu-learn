import CourseSettings from "./CourseSettings";
import CreateCourseSectionButton from "./CreateCourseSectionButton";
import CoursePageContext from "./context";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ButtonGroup from "atoms/ButtonGroup";
import DropdownButton from "atoms/DropdownButton";
import LinkButton from "atoms/LinkButton";
import RenderCourseSection from "components/RenderCourseSection";
import SEO from "helpers/SEO";
import useWindowDimensions from "hooks/useWindowDimensions";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import type { Course, CourseSection } from "types";

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
            <div className="w-full h-52 relative">
              <Image
                src={course.bannerImage ?? "/assets/default-course-banner.png"}
                alt="Course banner"
                layout="fill"
                className="object-cover lg:rounded-xl"
                style={{ zIndex: "-1" }}
              />
              <div className="w-full h-full flex items-center justify-center">
                <div className="absolute left-3 top-2">
                  <Link href="/home">
                    <a>
                      <FontAwesomeIcon
                        icon={faArrowLeft}
                        size="2x"
                        className="text-white"
                      />
                    </a>
                  </Link>
                </div>
                <h1 className="font-bold text-4xl text-center text-white">
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
          <div className="md:container mx-auto px-4 mt-6">
            <CoursePageContext.Provider value={{ course, refreshData }}>
              {course?.courseSections?.map((courseSection) => (
                <RenderCourseSection
                  courseSection={courseSection as CourseSection}
                  key={courseSection?.id as string}
                />
              ))}
            </CoursePageContext.Provider>
          </div>
          <div className="text-center">
            <p className="text-white">.</p>
            {course.courseSections?.length === 0 && (
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
