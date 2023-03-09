import TextInput from "alu-ui/src/TextInput";
import FlashcardList from "@/courses/FlashcardList";
import SearchFlashcards from "graphql-operations/operations/SearchFlashcards";
import SEO from "@/helpers/SEO";
import { useDebounce } from "helpers-lib/src/hooks/useDebounce";
import type {
  Course,
  FlashcardWithId,
  Query,
  QuerySearchFlashcardsArgs,
} from "@/types";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export interface SearchFlashcardsPageProps {
  course: Course;
  canEditCourse: boolean;
}

/**
 * Search for flashcards in a course
 */
export default function SearchFlashcardsPage({
  course,
  canEditCourse,
}: SearchFlashcardsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 750);
  const [, { data: searchData, loading, refetch: searchFlashcards }] =
    useLazyQuery<
      {
        searchFlashcards: Query["searchFlashcards"];
      },
      QuerySearchFlashcardsArgs
    >(SearchFlashcards, {
      variables: {
        text: debouncedSearchTerm,
        courseId: course.id as string,
      },
    });
  const { searchFlashcards: searchedFlashcards } = searchData ?? {};

  useEffect(() => {
    if (debouncedSearchTerm === searchTerm && searchTerm.length > 0)
      searchFlashcards();
  }, [debouncedSearchTerm, searchTerm, searchFlashcards]);

  return (
    <>
      <SEO
        title={`Search Flashcards in ${course.title}`}
        path={`course/${course.id}/search`}
        description={`Search for flashcards in ${course.title}. Alu has high-quality spaced repetition flashcards for ${course.title} to help you ace your exams`}
      />
      <div className="mx-auto max-w-4xl mt-28 px-5">
        <h1 className="text-4xl font-bold text-center">
          Search Flashcards in {course.title}
        </h1>
        <div className="mt-5 mb-3">
          <TextInput
            label="Search Flashcards"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-lg mx-auto"
          />
        </div>
        {searchTerm !== debouncedSearchTerm ||
        loading ||
        (!!searchTerm && searchedFlashcards === undefined) ? (
          <p className="text-center">Searching...</p>
        ) : (
          <div>
            {searchedFlashcards && searchedFlashcards.length > 0 ? (
              <FlashcardList
                flashcards={searchedFlashcards as FlashcardWithId[]}
                canEdit={canEditCourse}
              />
            ) : (
              <p className="text-center mt-3">No flashcards found</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
