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

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [, { data: searchedCourses, refetch: searchCourses }] = useLazyQuery<
    {
      searchCourses: Query["searchCourses"];
    },
    QuerySearchCoursesArgs
  >(SearchCourses);

  useEffect(() => {
    console.log(debouncedQuery, query, debouncedQuery === query);
    if (debouncedQuery.length >= 3 && debouncedQuery === query)
      searchCourses({ title: query });
  }, [debouncedQuery, query, searchCourses]);

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
        {selectedCourseId ? (
          <div className="px-3 py-2 bg-gray-100 border-2 border-gray-200 mb-3 rounded-full">
            <Link href={`/course/${selectedCourseId}`} target="_blank">
              <a className="text-blue-600">
                {
                  searchedCourses?.searchCourses?.find(
                    (c) => c?.id && c?.id === selectedCourseId
                  )?.title
                }
              </a>
            </Link>{" "}
            <FontAwesomeIcon
              icon={faX}
              role="button"
              className="text-gray-600 float-right mt-1 ml-2"
              title="Remove"
              onClick={() => setSelectedCourseId(null)}
            />
          </div>
        ) : (
          <ComboBox
            options={
              (searchedCourses?.searchCourses?.map((course) => ({
                value: course?.id,
                label: course?.title,
              })) ?? []) as Option[]
            }
            onQueryChange={(e) => setQuery(e.target.value)}
            onChange={(courseId) => setSelectedCourseId(courseId as string)}
            placeholder="Add Course (search by title)"
            loading={debouncedQuery !== query}
            clearOnChange
            className="mb-3"
          />
        )}
      </AsyncForm>
    </Modal>
  );
}
