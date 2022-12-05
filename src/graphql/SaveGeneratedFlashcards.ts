import { gql } from "@apollo/client";

const SaveGeneratedFlashcards = gql`
  mutation SaveGeneratedFlashcards(
    $generatedFlashcards: [JSONObject]!
    $courseTitle: String
    $subSectionId: String
  ) {
    saveGeneratedFlashcards(
      generatedFlashcards: $generatedFlashcards
      courseTitle: $courseTitle
      subSectionId: $subSectionId
    )
  }
`;

export default SaveGeneratedFlashcards;
