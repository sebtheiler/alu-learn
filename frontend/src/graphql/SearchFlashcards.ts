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

export default SearchFlashcards;
