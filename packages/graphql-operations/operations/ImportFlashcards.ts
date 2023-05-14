import { gql } from "@apollo/client";

const ImportFlashcards = gql`
  mutation ImportFlashcards(
    $importTxt: String!
    $courseTitle: String
    $subSectionId: String
  ) {
    importFlashcards(
      importTxt: $importTxt
      courseTitle: $courseTitle
      subSectionId: $subSectionId
    )
  }
`;

export default ImportFlashcards;
