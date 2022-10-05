import { gql } from "@apollo/client";

const UpdateFlashcard = gql`
  mutation UpdateFlashcard(
    $flashcardId: String!
    $tags: String
    $fields: String
  ) {
    updateFlashcard(flashcardId: $flashcardId, tags: $tags, fields: $fields) {
      id
    }
  }
`;

export default UpdateFlashcard;
