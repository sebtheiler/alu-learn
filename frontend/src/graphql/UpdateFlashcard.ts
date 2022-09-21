import { gql } from "@apollo/client";

const UpdateFlashcard = gql`
  mutation UpdateFlashcard(
    $flashcardId: String!
    $tags: String
    $fields: String
    $starred: Boolean
  ) {
    updateFlashcard(
      flashcardId: $flashcardId
      tags: $tags
      fields: $fields
      starred: $starred
    ) {
      id
    }
  }
`;

export default UpdateFlashcard;
