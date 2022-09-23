import ComboBox from "@/atoms/ComboBox";
import SearchCourses from "@/graphql/SearchCourses";
import { useDebounce } from "@/hooks/useDebounce";
import type { Course, Option, Query, QuerySearchCoursesArgs } from "@/types";
import { useLazyQuery } from "@apollo/client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SelectCourse({
  selectedCourseId,
  setSelectedCourseId,
  defaultSearch,
}: {
  selectedCourseId: string | null;
  setSelectedCourseId(v: string | null): void;
  defaultSearch?: Course[];
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);
  const [, { data: searchedCourses, refetch: searchCourses }] = useLazyQuery<
    {
      searchCourses: Query["searchCourses"];
    },
    QuerySearchCoursesArgs
  >(SearchCourses);

  useEffect(() => {
    if (debouncedQuery.length >= 3 && debouncedQuery === query)
      searchCourses({ title: query });
  }, [debouncedQuery, query, searchCourses]);

  if (selectedCourseId) {
    return (
      <div className="px-3 py-2 bg-gray-100 border-2 border-gray-200 mb-3 rounded-full">
        <Link href={`/course/${selectedCourseId}`} target="_blank">
          <a className="text-blue-600">
            {
              (searchedCourses?.searchCourses ?? defaultSearch)?.find(
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
    );
  } else {
    return (
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
    );
  }
}
