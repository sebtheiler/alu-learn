import { gql } from "@apollo/client";

const DeleteFlashcard = gql`
  mutation DeleteFlashcard($flashcardId: String!) {
    deleteFlashcard(flashcardId: $flashcardId) {
      id
    }
  }
`;

export default DeleteFlashcard;
