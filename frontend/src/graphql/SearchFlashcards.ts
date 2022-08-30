import type { Query } from "@/types";
import { gql } from "@apollo/client";

const SearchFlashcards = gql`
  query SearchFlashcards($text: String, $courseId: String) {
    searchFlashcards(text: $text, courseId: $courseId) {
      id
      fields
      tags
      type
    }
  }
`;

type SearchFlashcardsType = { searchFlashcards: Query["searchFlashcards"] };

export default SearchFlashcards;
export type { SearchFlashcardsType };
