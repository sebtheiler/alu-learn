import ClassroomPageContext from "./context";
import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import RenderSubSection from "@/courses/RenderSubSection";
import SEO from "@/helpers/SEO";
import type { Classroom, Assignment, SubSection } from "@/types";

export interface StudentClassroomPageProps {
  classroom: Classroom;
  assignments: (Assignment & { assignedSubSections: SubSection[] })[];
}

export default function StudentClassroomPage({
  classroom,
  assignments,
}: StudentClassroomPageProps) {
  // TODO: Load the course for this classroom and display it as a normal course page with some extra stuff
  return (
    <>
      <SEO title={classroom.title as string} path="classes" description="" />
      <div className="mt-28">
        <h1 className="text-center text-4xl font-bold">{classroom.title}</h1>
        <ClassroomPageContext.Provider value={{ classroom }}>
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-5 max-w-2xl bg-gray-100 border-4 border-gray-200 rounded-xl my-4 mx-auto"
            >
              <h4 className="text-center text-2xl font-bold">
                {assignment.title}
              </h4>
              <ButtonGroup
                className="text-center mt-2 mb-5"
                fixedWidth="150px"
                spaced
              >
                <LinkButton
                  href={`/classroom/${classroom?.id}/study/${assignment?.id}`}
                >
                  Study
                </LinkButton>
                <LinkButton
                  href={`/classroom/${classroom?.id}/flashcards/${assignment?.id}`}
                >
                  Flashcards
                </LinkButton>
              </ButtonGroup>
              {assignment.assignedSubSections.map((subSection) => (
                <RenderSubSection
                  subSection={subSection}
                  assignment={assignment}
                  key={subSection.id}
                />
              ))}
            </div>
          ))}
        </ClassroomPageContext.Provider>
      </div>
    </>
  );
}
