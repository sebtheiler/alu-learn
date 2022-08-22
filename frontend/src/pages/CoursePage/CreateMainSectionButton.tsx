import { useMutation } from "@apollo/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
import CreateMainSection from "graphql/CreateMainSection";
import { getElementsVals } from "helpers/getElementsVals";
import { useState } from "react";
import type { Course } from "types";

interface CreateMainSectionButtonProps {
  course: Course;
  refreshData(): void;
}

export default function CreateMainSectionButton({
  course,
  refreshData,
}: CreateMainSectionButtonProps) {
  const [createMainSection] = useMutation(CreateMainSection);

  const [createMainSectionModalOpen, setCreateMainSectionModalOpen] =
    useState(false);

  const handleCreateMainSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { mainSectionTitle } = getElementsVals(e.target as HTMLFormElement, [
      "mainSectionTitle",
    ]);

    await createMainSection({
      variables: {
        title: mainSectionTitle,
        courseId: course.id,
      },
    });

    refreshData();
    setCreateMainSectionModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setCreateMainSectionModalOpen(true)}
        faIcon={faPlus}
        className="mb-3"
      >
        Add Section
      </Button>
      <Modal
        open={createMainSectionModalOpen}
        close={() => setCreateMainSectionModalOpen(false)}
      >
        <h2 className="text-2xl font-bold text-center mb-3">Add Section</h2>
        <AsyncForm
          onSubmit={handleCreateMainSection}
          buttonProps={{ block: true, children: "Add Section" }}
        >
          <TextInput
            label="Section Title"
            className="mb-3"
            name="mainSectionTitle"
            required
          />
        </AsyncForm>
      </Modal>
    </>
  );
}
