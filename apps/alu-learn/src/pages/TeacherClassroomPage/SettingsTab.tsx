import SelectCourse from "../ClassesPage/SelectCourse";
import AsyncForm from "alu-ui/src/AsyncForm";
import TextInput from "alu-ui/src/TextInput";
import UpdateClassroom from "graphql-operations/operations/UpdateClassroom";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import type { Classroom, Mutation, MutationUpdateClassroomArgs } from "@/types";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SettingsTab({ classroom }: { classroom: Classroom }) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    classroom.courseId ?? null
  );
  const [updateClassroom] = useMutation<
    { updateClassroom: Mutation["updateClassroom"] },
    MutationUpdateClassroomArgs
  >(UpdateClassroom);

  const updateClassroomHandler = async (e: React.FormEvent) => {
    const { title } = getElementsVals(e.target as HTMLFormElement, ["title"]);

    await updateClassroom({
      variables: {
        classroomId: classroom.id as string,
        courseId: selectedCourseId ?? undefined,
        title: title === classroom.title ? undefined : title,
      },
    });
    router.push(router.asPath);
  };

  return (
    <>
      <h2 className="mt-3 mb-2 text-center font-bold text-2xl">Settings</h2>
      <AsyncForm
        className="text-center max-w-md mx-auto"
        onSubmit={updateClassroomHandler}
        buttonProps={{ block: true, children: "Save Changes" }}
      >
        <div className="text-left">
          <TextInput
            label="Title"
            name="title"
            className="mb-3"
            defaultValue={classroom.title ?? ""}
            required
          />
          <SelectCourse
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            // @ts-ignore
            defaultSearch={[classroom.course]}
          />
        </div>
      </AsyncForm>
    </>
  );
}
