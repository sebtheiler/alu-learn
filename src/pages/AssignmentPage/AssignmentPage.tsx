import Checkbox from "@/atoms/Checkbox";
import UpdateAssignment from "@/graphql/UpdateAssignment";
import SEO from "@/helpers/SEO";
import englishList from "@/helpers/englishList";
import formatTimeTaken from "@/helpers/formatTimeTaken";
import type {
  Assignment,
  Classroom,
  Mutation,
  MutationUpdateAssignmentArgs,
  SubSection,
  User,
} from "@/types";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";

type AssignmentWithClassrooms = Assignment & {
  classrooms: Classroom[];
  assignedSubSections: SubSection[];
};
export type StudentProgress = {
  student: User;
  percentComplete: number;
  timeTaken: number; // in ms
};

export interface AssignmentPageProps {
  classroomId: string;
  assignment: AssignmentWithClassrooms;
  studentProgress: StudentProgress[];
}

/**
 * Renders a page where a teacher can edit and track the progress of students
 * on a single assignment
 */
export default function AssignmentPage({
  assignment,
  classroomId,
  studentProgress,
}: AssignmentPageProps) {
  const [updateAssignment] = useMutation<
    { createSubSection: Mutation["updateAssignment"] },
    MutationUpdateAssignmentArgs
  >(UpdateAssignment);

  return (
    <>
      <SEO
        title="Assignment"
        path={`classroom/${classroomId}/assignments/${assignment.id}`}
        description="Manage your assignments in Alu Learn"
      />
      <div className="mt-28">
        <h1 className="text-center text-4xl font-bold">{assignment.title}</h1>
        <p className="my-1 text-center">
          Assigned to:
          {assignment.classrooms.map((classroom) => (
            <Link href={`/classroom/${classroom.id}`} key={classroom.id}>
              <a className="text-blue-500 px-2 py-1 rounded-full bg-gray-200 mx-2">
                {classroom.title}
              </a>
            </Link>
          ))}
        </p>
        <div className="max-w-2xl mx-auto">
          <hr className="my-2" />
          <p className="my-1">
            Includes Subsections:{" "}
            {englishList(
              assignment.assignedSubSections.map((ss) => ss.title as string)
            )}
          </p>
          <Checkbox
            label={<p className="text-black font-large">Essential only?</p>}
            defaultChecked={assignment.essentialOnly ?? false}
            className="mt-3"
            onChange={(e) =>
              updateAssignment({
                variables: {
                  assignmentId: assignment.id as string,
                  essentialOnly: e.target.checked,
                },
              })
            }
          />
          <hr className="mt-8 mb-3" />
        </div>
        <div className="mt-5 max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold">Student Progress</h2>
          <ul className="border-2 border-gray-200 rounded-xl overflow-hidden mt-3">
            <li className="flex items-center border-b-2 border-gray-200 p-3 font-bold">
              <span className="w-1/3 flex items-center">Name</span>
              <span className="w-1/3">Percent Complete</span>
              <span className="w-1/3">Time Spent</span>
            </li>
            {studentProgress.map(({ student, percentComplete, timeTaken }) => (
              <li
                key={student.id}
                className="flex items-center border-b-2 border-gray-200 last:border-b-0 p-3 hover:bg-gray-100 relative"
              >
                <span className="w-1/3 flex items-center">
                  {student.image && (
                    <Image
                      src={student.image}
                      width={28}
                      height={28}
                      alt={`${student.name}'s profile picture`}
                      className="rounded-full"
                    />
                  )}
                  <span className="ml-1">{student.name}</span>
                </span>
                <span className="w-1/3">
                  {Math.round(percentComplete * 100)}%
                </span>
                <span className="w-1/3">{formatTimeTaken(timeTaken)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
