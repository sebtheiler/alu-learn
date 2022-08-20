import { useMutation } from "@apollo/client";
import AsyncForm from "atoms/AsyncForm";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
import CreateCourse from "graphql/CreateCourse";
import { getElementsVals } from "helpers/getElementsVals";
import { useRouter } from "next/router";

export default function CreateAddCourseModal({ open, close }) {
  // TODO: type this
  const [createCourse] = useMutation<{ createCourse: { id: string } }>(CreateCourse);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const { data } = await createCourse({
      variables: {
        title: getElementsVals(e.target as HTMLFormElement, [
          "courseName",
        ]).courseName,
      },
    });

    if (data) {
      router.push(`/course/${data.createCourse.id}`)
    }
  }
        

  return (
    <Modal open={open} close={close}>
      <h1 className="text-center text-4xl font-bold">Create or Add Course</h1>
      <hr className="mt-2 mb-5" />
      <h3 className="text-xl font-bold mb-1">Add Existing Course</h3>
      <TextInput label="Search Course" />

      <div className="flex items-center mt-4 mb-3">
        <div className="flex-grow bg bg-gray-300 h-0.5"></div>
        <div className="flex-grow-0 mx-5 text dark:text-white">or</div>
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
