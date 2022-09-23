import SelectCourse from "./SelectCourse";
import AsyncForm from "@/atoms/AsyncForm";
import ComboBox from "@/atoms/ComboBox";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import CreateClassroom from "@/graphql/CreateClassroom";
import SearchCourses from "@/graphql/SearchCourses";
import { getElementsVals } from "@/helpers/getElementsVals";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  Mutation,
  MutationCreateClassroomArgs,
  Option,
  Query,
  QuerySearchCoursesArgs,
} from "@/types";
import { useLazyQuery, useMutation } from "@apollo/client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
