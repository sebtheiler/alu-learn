import { gql } from "@apollo/client";

const UpdateFlashcard = gql`
  mutation UpdateFlashcard(
    $flashcardId: String!
    $tags: String
    $fields: JSONObject
  ) {
    updateFlashcard(flashcardId: $flashcardId, tags: $tags, fields: $fields) {
      id
    }
  }
`;

export default UpdateFlashcard;
