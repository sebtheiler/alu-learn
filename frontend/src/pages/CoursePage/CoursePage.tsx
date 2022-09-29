import Ad from "@/components/Ad";
import RenderCourse from "@/courses/RenderCourse";
import SEO from "@/helpers/SEO";
import type { Course } from "@/types";

export interface CoursePageProps {
  /**
   * Course to display
   */
  course: Course;
  /**
   * Is the user authorized to view the course? (course is null if true)
   */
  viewAccess: boolean;
  /**
   * Is the user authorized to edit the course?
   */
  editAccess: boolean;
}

/**
 * Renders the page for a course, with all of its course sections and sub sections
 */
export default function CoursePage({
  course,
  viewAccess,
  editAccess,
}: CoursePageProps) {
  return (
    <>
      <SEO
        title={course?.title ?? "Course"}
        path={`course/${course?.id}`}
        description={
          course.seoDescription ??
          `${course.title} study guide flashcards. Learn ${course.title} for free with spaced repetition flashcards and games`
        }
      />
      {viewAccess && (
        <div className="mt-28">
          <RenderCourse course={course} editAccess={editAccess} />
        </div>
      )}
      {!viewAccess && (
        <div className="mt-28 text-center">
          <p>You are not authorized to view this course</p>
        </div>
      )}
      <footer className="md:px-10">
        <Ad adType="COURSE_BOTTOM" />
      </footer>
    </>
  );
}
