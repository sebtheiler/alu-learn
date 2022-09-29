import RenderCourse from "@/courses/RenderCourse";
import SEO from "@/helpers/SEO";
import type { Classroom, Course, AssignmentWithSubSections } from "@/types";

export interface StudentClassroomPageProps {
  classroom: Classroom;
  course: Course;
  assignments: AssignmentWithSubSections[];
}

export default function StudentClassroomPage({
  classroom,
  assignments,
  course,
}: StudentClassroomPageProps) {
  return (
    <>
      <SEO
        title={classroom.title as string}
        path="classes"
        description={`Study for ${classroom.title} with free online spaced repetition flashcards and games`}
      />
      <div className="mt-28">
        <RenderCourse
          course={course}
          editAccess={false}
          assignments={assignments}
          classroom={classroom}
        />
      </div>
    </>
  );
}
