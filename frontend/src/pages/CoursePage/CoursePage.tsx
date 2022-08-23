import CourseSettings from "./CourseSettings";
import CreateMainSectionButton from "./CreateMainSectionButton";
import CoursePageContext from "./context";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RenderMainSection from "components/RenderMainSection";
import SEO from "helpers/SEO";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import type { Course, MainSection } from "types";

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
 * Renders the page for a course, with all of its main sections and sub sections
 */
export default function CoursePage({ course, authorized }: CoursePageProps) {
  const router = useRouter();
  const refreshData = () => router.replace(router.asPath);

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
          <div className="mx-auto max-w-5xl px-4">
            <div className="float-left pt-2">
              <Link href="/home">
                <a>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    size="2x"
                    className="text-gray-600 md:absolute md:float-left md:left-10"
                  />
                </a>
              </Link>
            </div>
            <h1 className="font-bold text-4xl text-center">{course.title}</h1>
            <CourseSettings course={course} refreshData={refreshData} />
          </div>
          <div className="md:container mx-auto px-4 mt-6">
            <CoursePageContext.Provider value={{ course, refreshData }}>
              {course?.mainSections?.map((mainSection) => (
                <RenderMainSection
                  mainSection={mainSection as MainSection}
                  key={mainSection?.id as string}
                />
              ))}
            </CoursePageContext.Provider>
          </div>
          <div className="text-center">
            <p className="text-white">.</p>
            {course.mainSections?.length === 0 && (
              <p className="mb-3 mx-auto">
                This course doesn&apos;t have any sections yet. Add one below to
                start organizing the course!
              </p>
            )}
            <CreateMainSectionButton
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
