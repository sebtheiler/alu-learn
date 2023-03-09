import { gql } from "@apollo/client";

const MoveFlashcardToSubSection = gql`
  mutation MoveFlashcardToSubSection(
    $flashcardId: String!
    $subSectionId: String!
  ) {
    moveFlashcardToSubSection(
      flashcardId: $flashcardId
      subSectionId: $subSectionId
    )
  }
`;

export default MoveFlashcardToSubSection;
