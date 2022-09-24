import SelectCourse from "./SelectCourse";
import AsyncForm from "@/atoms/AsyncForm";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import CreateClassroom from "@/graphql/CreateClassroom";
import { getElementsVals } from "@/helpers/getElementsVals";
import type { Mutation, MutationCreateClassroomArgs } from "@/types";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";

export default function CreateClassroomModal({
  open,
  close,
}: {
  open: boolean;
  close(): void;
}) {
  const router = useRouter();
  const [createClassroom] = useMutation<
    { createClassroom: Mutation["createClassroom"] },
    MutationCreateClassroomArgs
  >(CreateClassroom);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const createClassroomHandler = async (e: React.FormEvent) => {
    const { title } = getElementsVals(e.target as HTMLFormElement, ["title"]);
    if (!selectedCourseId) return;

    await createClassroom({
      variables: {
        title,
        courseId: selectedCourseId,
      },
    });

    close();
    router.push(router.asPath);
  };

  return (
    <Modal open={open} close={close} title="Create Classroom">
      <AsyncForm
        onSubmit={createClassroomHandler}
        buttonProps={{ children: "Create Classroom", block: true }}
      >
        <TextInput label="Title" name="title" className="mb-3" required />
        <SelectCourse
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
        />
      </AsyncForm>
    </Modal>
  );
}
