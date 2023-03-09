import SelectCourse from "../ClassesPage/SelectCourse";
import AsyncForm from "alu-ui/src/AsyncForm";
import Modal from "alu-ui/src/Modal";
import TextInput from "alu-ui/src/TextInput";
import CreateCourse from "graphql-operations/operations/CreateCourse";
import JoinCourse from "graphql-operations/operations/JoinCourse";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import type {
  Mutation,
  MutationCreateCourseArgs,
  MutationJoinCourseArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CreateAddCourseModal({ open, close }) {
  const [createCourse] = useMutation<
    { createCourse: Mutation["createCourse"] },
    MutationCreateCourseArgs
  >(CreateCourse);
  const [joinCourse] = useMutation<
    { joinCourse: Mutation["joinCourse"] },
    MutationJoinCourseArgs
  >(JoinCourse);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedCourseId) {
      joinCourse({
        variables: {
          courseId: selectedCourseId,
        },
      }).then(() => router.push(`/course/${selectedCourseId}`));
    }
  }, [selectedCourseId, router, joinCourse]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const { data } = await createCourse({
      variables: {
        title: getElementsVals(e.target as HTMLFormElement, ["courseName"])
          .courseName,
      },
    });

    if (data) {
      router.push(`/course/${data.createCourse?.id}`);
    }
  };

  return (
    <Modal open={open} close={close}>
      <h1 className="text-center text-4xl font-bold">Create or Add Course</h1>
      <hr className="mt-2 mb-5" />
      <h3 className="text-xl font-bold mb-1">Add Existing Course</h3>
      <SelectCourse
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
      />

      <div className="flex items-center mt-4 mb-3">
        <div className="flex-grow bg bg-gray-300 h-0.5"></div>
        <div className="flex-grow-0 mx-5 text">or</div>
        <div className="flex-grow bg bg-gray-300 h-0.5"></div>
      </div>

      <h3 className="text-xl font-bold mb-1">Create New Course</h3>
      <AsyncForm
        onSubmit={onSubmit}
        buttonProps={{ children: "Create", block: true }}
      >
        <TextInput label="Course Name" className="mb-3" name="courseName" />
      </AsyncForm>
    </Modal>
  );
}
