import AsyncForm from "alu-ui/src/AsyncForm";
import Button from "alu-ui/src/Button";
import Modal from "alu-ui/src/Modal";
import TextInput from "alu-ui/src/TextInput";
import CreateCourseSection from "graphql-operations/operations/CreateCourseSection";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import type { Course } from "@/types";
import { useMutation } from "@apollo/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface CreateCourseSectionButtonProps {
  course: Course;
  refreshData(): void;
}

export default function CreateCourseSectionButton({
  course,
  refreshData,
}: CreateCourseSectionButtonProps) {
  const [createCourseSection] = useMutation(CreateCourseSection);

  const [createCourseSectionModalOpen, setCreateCourseSectionModalOpen] =
    useState(false);

  const handleCreateCourseSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { courseSectionTitle } = getElementsVals(
      e.target as HTMLFormElement,
      ["courseSectionTitle"]
    );

    await createCourseSection({
      variables: {
        title: courseSectionTitle,
        courseId: course.id,
      },
    });

    refreshData();
    setCreateCourseSectionModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setCreateCourseSectionModalOpen(true)}
        faIcon={faPlus}
        className="my-5 mb-3 text-center mx-auto"
      >
        Add Section
      </Button>
      <Modal
        open={createCourseSectionModalOpen}
        close={() => setCreateCourseSectionModalOpen(false)}
      >
        <h2 className="text-2xl font-bold text-center mb-3">Add Section</h2>
        <AsyncForm
          onSubmit={handleCreateCourseSection}
          buttonProps={{ block: true, children: "Add Section" }}
        >
          <TextInput
            label="Section Title"
            className="mb-3"
            name="courseSectionTitle"
            required
          />
        </AsyncForm>
      </Modal>
    </>
  );
}
