import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import Checkbox from "@/atoms/Checkbox";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import CreateAssignment from "@/graphql/CreateAssignment";
import { getElementsVals } from "@/helpers/getElementsVals";
import {
  Assignment,
  Classroom,
  CourseSection,
  Mutation,
  MutationCreateAssignmentArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function AssignmentsTab({
  assignments,
  courseSections,
  classrooms,
  classroom,
}: {
  assignments: Assignment[];
  courseSections: CourseSection[];
  classrooms: Classroom[];
  classroom: Classroom;
}) {
  const router = useRouter();
  const [createAssignmentModalOpen, setCreateAssignmentModalOpen] =
    useState(false);
  const [createAssignment] = useMutation<
    { createAssignment: Mutation["createAssignment"] },
    MutationCreateAssignmentArgs
  >(CreateAssignment);

  const createAssignmentHandler = async (e: React.FormEvent) => {
    const { title } = getElementsVals(e.target as HTMLFormElement, ["title"]);

    // Get sub sections to assign
    const subSectionsEl = document.getElementsByName(
      "subSections"
    )[0] as HTMLSelectElement;
    const subSectionIds = Array.from(subSectionsEl.options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    // Get classroosm to create assignment in
    const assignToClassroomEls = document.getElementsByName(
      "assignToClassroom"
    ) as NodeListOf<HTMLInputElement>;
    const assignToClassroomIds = Array.from(assignToClassroomEls)
      .filter((el) => el.checked)
      .map((el) => el.value);

    if (subSectionIds.length === 0 || assignToClassroomIds.length === 0)
      return null;

    // Crete assignment
    await createAssignment({
      variables: {
        title,
        subSectionIds,
        classroomIds: assignToClassroomIds,
      },
    });

    setCreateAssignmentModalOpen(false);
    router.push(router.asPath);
  };

  return (
    <>
      <h2 className="mt-3 mb-2 text-center font-bold text-2xl">Assignments</h2>
      <div className="my-3">
        {assignments.map((assignment) => (
          <Link
            href={`/classroom/${classroom.id}/assignments/${assignment.id}`}
            key={assignment.id}
          >
            <a>
              <div className="max-w-xs bg-gray-100 border-4 border-gray-200 rounded-xl p-5 mx-auto my-2 hover:scale-105 transition duration-150">
                <h3 className="font-bold text-center">{assignment.title}</h3>
              </div>
            </a>
          </Link>
        ))}
      </div>
      <div className="text-center">
        <Button
          faIcon={faPlus}
          className="mt-2"
          onClick={() => setCreateAssignmentModalOpen(true)}
        >
          Create Assignment
        </Button>
        <Modal
          open={createAssignmentModalOpen}
          close={() => setCreateAssignmentModalOpen(false)}
          title="Create Assignment"
        >
          <AsyncForm
            onSubmit={createAssignmentHandler}
            buttonProps={{ block: true, children: "Create Assignment" }}
          >
            <TextInput label="Title" name="title" className="mb-3" required />
            <div>
              <label htmlFor="subSections">
                Sections to Assign (Hold ctrl/cmd to select multiple)
              </label>
              <select
                name="subSections"
                className="w-full border-gray-200 focus:border-alu-primary-purple border-2 rounded-xl p-3 mt-1 mb-3 focus:outline-none"
                multiple
              >
                {courseSections.map((courseSection) => (
                  <optgroup
                    label={courseSection.title as string}
                    key={courseSection.id}
                    className="font-bold"
                  >
                    {courseSection.subSections?.map(
                      (subSection) =>
                        subSection && (
                          <option
                            value={subSection.id as string}
                            key={subSection.id}
                          >
                            {subSection.title}
                          </option>
                        )
                    )}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <p className="mb-1">Assign to classrooms</p>
              {classrooms
                .filter(
                  (_classroom) => _classroom.courseId === classroom.courseId
                )
                .map((_classroom) => (
                  <Checkbox
                    key={_classroom.id}
                    label={_classroom.title}
                    value={_classroom.id as string}
                    defaultChecked={_classroom.id === classroom.id}
                    name="assignToClassroom"
                  />
                ))}
            </div>
          </AsyncForm>
        </Modal>
      </div>
    </>
  );
}
